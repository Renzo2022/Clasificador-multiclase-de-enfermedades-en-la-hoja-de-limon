export interface RoboflowRawDetection {
  x: number; // Center x of bounding box in pixels
  y: number; // Center y of bounding box in pixels
  width: number; // Width of bounding box in pixels
  height: number; // Height of bounding box in pixels
  confidence: number; // Confidence score (0.0 to 1.0)
  class: string; // Predicted class name (e.g., "spider_mites")
  class_id: number; // Predicted class ID
  detection_id: string; // Unique ID for this detection
}

export interface RoboflowResponse {
  predictions?: RoboflowRawDetection[];
  image?: {
    width: number; // Original image width in pixels
    height: number; // Original image height in pixels
  };
  error?: string | { message: string; type: string }; // Error message from Roboflow
}

// Represents a single detected instance of a disease (one bounding box)
export interface DetectionInstance {
  x: number; // Center x of bounding box
  y: number; // Center y of bounding box
  width: number; // Width of bounding box
  height: number; // Height of bounding box
  confidence: number; // Confidence of this specific instance
}

// Represents all detections for a single, unique disease type found in an image
export interface DiseaseDetections {
  diseaseName: string;
  instances: DetectionInstance[]; // All bounding boxes for this specific disease
  highestConfidence: number; // The maximum confidence among all instances of this disease
}

// The final, fully processed report for a single unique disease, including its AI-generated guide
export interface ProcessedDiseaseReport {
  diseaseName: string;
  instances: DetectionInstance[];
  highestConfidence: number;
  enhancedDescription: string; // Markdown string from AI
  imageUrl: string; // URL of the analyzed image (could be blob or remote)
  imageNaturalWidth: number; // Natural width of the analyzed image
  imageNaturalHeight: number; // Natural height of the analyzed image
}

// Overall result from the backend action before AI enhancement
export interface PredictionServiceResponse {
  groupedDetections?: DiseaseDetections[];
  imageUrlToDisplay?: string; // The URL (blob or remote) of the image that was analyzed
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
  error?: string;
  isHealthyOrUndetermined?: boolean; // Flag if no specific diseases were confidently detected
}
