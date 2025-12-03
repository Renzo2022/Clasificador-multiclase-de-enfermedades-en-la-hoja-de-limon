'use server';

import axios from 'axios';
import type { RoboflowResponse, RoboflowRawDetection, DiseaseDetections, DetectionInstance, PredictionServiceResponse } from '@/types/index';
import { ROBOFLOW_API_KEY, ROBOFLOW_API_URL } from '@/config/constants';

const MIN_CONFIDENCE_THRESHOLD = 0.25; // Minimum confidence for a disease class to be considered

export async function predictDiseaseAction(formData: FormData): Promise<PredictionServiceResponse> {
  const imageFile = formData.get('imageFile') as File | null;
  const imageUrlInput = formData.get('imageUrl') as string | null;

  let roboflowApiResponse: RoboflowResponse;
  let imageNaturalWidth: number | undefined;
  let imageNaturalHeight: number | undefined;
  let imageUrlToDisplay: string | undefined;

  if (!ROBOFLOW_API_KEY || !ROBOFLOW_API_URL) {
    return { error: "API key or URL for Roboflow is not configured. Please check server environment variables."};
  }

  try {
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 4 * 1024 * 1024) {
        return { error: 'Image file is too large. Please upload an image smaller than 4MB.' };
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(imageFile.type)) {
        return { error: 'Invalid file type. Please upload a JPG or PNG image.' };
      }

      // For display, we'll need a URL for the image. Create a blob URL if it's a file.
      // This is temporary and client-side only if not handled by server state.
      // However, since this is a server action, we can't directly create a blob URL for the client.
      // The client will use its preview URL. We'll pass back image dimensions from Roboflow.
      // The actual image data is sent to Roboflow as base64.
      
      const imageBuffer = await imageFile.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      const response = await axios({
        method: 'POST',
        url: ROBOFLOW_API_URL,
        params: { api_key: ROBOFLOW_API_KEY },
        data: imageBase64,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20000,
      });
      roboflowApiResponse = response.data;
      imageUrlToDisplay = formData.get('previewUrl') as string; // Use client-side preview URL
    } else if (imageUrlInput) {
      try {
        new URL(imageUrlInput);
      } catch (_) {
        return { error: 'Invalid image URL format.' };
      }
      const response = await axios({
        method: 'POST',
        url: ROBOFLOW_API_URL,
        params: { api_key: ROBOFLOW_API_KEY, image: imageUrlInput },
        timeout: 20000,
      });
      roboflowApiResponse = response.data;
      imageUrlToDisplay = imageUrlInput;
    } else {
      return { error: 'Please provide either an image file or an image URL.' };
    }

    if (roboflowApiResponse.error) {
      const errorMessage = typeof roboflowApiResponse.error === 'string'
        ? roboflowApiResponse.error
        : (roboflowApiResponse.error.message || 'Unknown Roboflow API error');
      return { error: `Prediction API Error: ${errorMessage}` };
    }

    imageNaturalWidth = roboflowApiResponse.image?.width;
    imageNaturalHeight = roboflowApiResponse.image?.height;

    if (!roboflowApiResponse.predictions || roboflowApiResponse.predictions.length === 0) {
      return { 
        groupedDetections: [{ diseaseName: 'Undetermined', instances: [], highestConfidence: 1.0 }],
        imageUrlToDisplay,
        imageNaturalWidth,
        imageNaturalHeight,
        isHealthyOrUndetermined: true,
      };
    }

    // Group predictions by class (disease name)
    const groupedByClass: Record<string, { detections: RoboflowRawDetection[], maxConfidence: number }> = {};
    for (const pred of roboflowApiResponse.predictions) {
      if (!groupedByClass[pred.class]) {
        groupedByClass[pred.class] = { detections: [], maxConfidence: 0 };
      }
      groupedByClass[pred.class].detections.push(pred);
      if (pred.confidence > groupedByClass[pred.class].maxConfidence) {
        groupedByClass[pred.class].maxConfidence = pred.confidence;
      }
    }
    
    const finalDetections: DiseaseDetections[] = [];
    let hasConfidentPrediction = false;

    for (const diseaseName in groupedByClass) {
      const group = groupedByClass[diseaseName];
      if (group.maxConfidence >= MIN_CONFIDENCE_THRESHOLD) {
        hasConfidentPrediction = true;
        finalDetections.push({
          diseaseName: diseaseName,
          highestConfidence: group.maxConfidence,
          instances: group.detections.map(d => ({
            x: d.x,
            y: d.y,
            width: d.width,
            height: d.height,
            confidence: d.confidence,
          })),
        });
      }
    }

    if (!hasConfidentPrediction) {
      // If no single disease class met the threshold, or if all were filtered out
      return {
        groupedDetections: [{ diseaseName: 'Undetermined', instances: [], highestConfidence: 1.0 }],
        imageUrlToDisplay,
        imageNaturalWidth,
        imageNaturalHeight,
        isHealthyOrUndetermined: true,
      };
    }
    
    // Sort by highest confidence descending for primary display
    finalDetections.sort((a,b) => b.highestConfidence - a.highestConfidence);

    return {
      groupedDetections: finalDetections,
      imageUrlToDisplay,
      imageNaturalWidth,
      imageNaturalHeight,
    };

  } catch (error: any) {
    console.error('Error in predictDiseaseAction:', error.message);
    let errorMessage = `An unexpected error occurred: ${error.message || 'Unknown error'}`;
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = "The request to the prediction API timed out. Please try again later.";
      } else if (error.response) {
        const apiError = error.response.data?.error || error.response.data;
        let specificMessage = "Failed to get specific error message from API.";
        if (typeof apiError === 'string') {
          specificMessage = apiError;
        } else if (apiError && typeof apiError.message === 'string') {
          specificMessage = apiError.message;
        }
        errorMessage = `Prediction API request failed (${error.response.status}): ${specificMessage}`;
      } else if (error.request) {
        errorMessage = "Prediction API request made but no response received. Check network or API status.";
      }
    }
    return { error: errorMessage };
  }
}
