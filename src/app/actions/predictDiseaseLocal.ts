// src/app/actions/predictDiseaseLocal.ts
'use server';

import { ModelService, defaultModelConfig, type ModelPrediction } from '@/services/modelService';
import type { PredictionServiceResponse } from '@/types/index';

// Global model instance (singleton pattern)
let modelService: ModelService | null = null;

async function getModelService(): Promise<ModelService> {
  if (!modelService) {
    modelService = new ModelService(defaultModelConfig);
    await modelService.loadModel();
  }
  return modelService;
}

export async function predictDiseaseLocalAction(formData: FormData): Promise<PredictionServiceResponse> {
  const imageFile = formData.get('imageFile') as File | null;
  const imageUrlInput = formData.get('imageUrl') as string | null;

  if (!imageFile && !imageUrlInput) {
    return { error: 'Please provide either an image file or an image URL.' };
  }

  try {
    let imageElement: HTMLImageElement | HTMLCanvasElement;
    
    if (imageFile && imageFile.size > 0) {
      // Validate file
      if (imageFile.size > 4 * 1024 * 1024) {
        return { error: 'Image file is too large. Please upload an image smaller than 4MB.' };
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(imageFile.type)) {
        return { error: 'Invalid file type. Please upload a JPG or PNG image.' };
      }

      // Convert File to ImageElement
      imageElement = await fileToImageElement(imageFile);
    } else if (imageUrlInput) {
      // Validate URL
      try {
        new URL(imageUrlInput);
      } catch (_) {
        return { error: 'Invalid image URL format.' };
      }
      
      // Load image from URL
      imageElement = await urlToImageElement(imageUrlInput);
    } else {
      return { error: 'Please provide either an image file or an image URL.' };
    }

    // Get model service and make prediction
    const service = await getModelService();
    const predictions = await service.predict(imageElement);

    if (predictions.length === 0) {
      return {
        groupedDetections: [{ diseaseName: 'Undetermined', instances: [], highestConfidence: 1.0 }],
        imageUrlToDisplay: imageUrlInput || 'local-image',
        imageNaturalWidth: imageElement.width,
        imageNaturalHeight: imageElement.height,
        isHealthyOrUndetermined: true,
      };
    }

    // Convert predictions to the expected format
    const groupedDetections = predictions.map(pred => ({
      diseaseName: pred.className,
      highestConfidence: pred.confidence,
      instances: pred.boundingBox ? [{
        x: pred.boundingBox.x,
        y: pred.boundingBox.y,
        width: pred.boundingBox.width,
        height: pred.boundingBox.height,
        confidence: pred.confidence,
      }] : [],
    }));

    return {
      groupedDetections,
      imageUrlToDisplay: imageUrlInput || 'local-image',
      imageNaturalWidth: imageElement.width,
      imageNaturalHeight: imageElement.height,
    };

  } catch (error: any) {
    console.error('Error in predictDiseaseLocalAction:', error.message);
    return { error: `Prediction failed: ${error.message || 'Unknown error'}` };
  }
}

// Helper functions
async function fileToImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function urlToImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

