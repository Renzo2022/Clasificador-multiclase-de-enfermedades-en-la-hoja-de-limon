// src/services/modelService.ts
export interface ModelPrediction {
  className: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ModelServiceConfig {
  serverUrl: string;
  confidenceThreshold: number;
}

export class ModelService {
  private config: ModelServiceConfig;

  constructor(config: ModelServiceConfig) {
    this.config = config;
  }

  async loadModel(): Promise<void> {
    try {
      console.log('Connecting to Python server:', this.config.serverUrl);
      // Test connection to Python server
      const response = await fetch(`${this.config.serverUrl}/health`);
      if (!response.ok) {
        throw new Error('Failed to connect to Python server');
      }
      console.log('Connected to Python server successfully');
    } catch (error) {
      console.error('Error connecting to Python server:', error);
      throw new Error('Failed to connect to Python server');
    }
  }

  async predict(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<ModelPrediction[]> {
    try {
      // Convert image to base64
      const base64Image = await this.imageToBase64(imageElement);
      
      // Send to Python server
      const response = await fetch(`${this.config.serverUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      // Process results
      const predictions: ModelPrediction[] = [];
      
      if (result.predictions && result.predictions.length > 0) {
        for (const pred of result.predictions) {
          if (pred.confidence >= this.config.confidenceThreshold) {
            predictions.push({
              className: pred.class,
              confidence: pred.confidence,
              boundingBox: {
                x: pred.x,
                y: pred.y,
                width: pred.width,
                height: pred.height
              }
            });
          }
        }
      }
      
      // Sort by confidence (highest first)
      predictions.sort((a, b) => b.confidence - a.confidence);
      
      return predictions;
    } catch (error) {
      console.error('Error during prediction:', error);
      throw new Error('Prediction failed');
    }
  }

  private async imageToBase64(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<string> {
    return new Promise((resolve, reject) => {
      if (imageElement instanceof HTMLImageElement) {
        // Convert HTMLImageElement to canvas first
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx.drawImage(imageElement, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
      } else {
        // Already a canvas
        imageElement.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
      }
    });
  }

  dispose(): void {
    // No cleanup needed for HTTP-based service
  }
}

// Default configuration for Python server
export const defaultModelConfig: ModelServiceConfig = {
  serverUrl: 'http://localhost:5000', // Python Flask server
  confidenceThreshold: 0.25
};
