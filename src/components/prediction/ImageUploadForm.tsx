
'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { predictDiseaseLocalAction } from '@/app/actions/predictDiseaseLocal';
import { enhanceDiseaseInformation } from '@/ai/flows/enhance-disease-information';
import { getDiseaseRecommendation } from '@/data/diseaseRecommendations';
import type { ProcessedDiseaseReport, PredictionServiceResponse } from '@/types/index';
import { PredictionResultCard } from './PredictionResultCard';
import { UploadCloud, Link2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const LOW_CONFIDENCE_THRESHOLD_UI = 0.50; // Threshold for showing low confidence message in UI

export function ImageUploadForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processedReports, setProcessedReports] = useState<ProcessedDiseaseReport[] | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrlInput('');
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setError(null);
      setProcessedReports(null);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrlInput(url);
    setImageFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    setError(null);
    setProcessedReports(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageFile && !imageUrlInput) {
      setError('Please upload an image or provide an image URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedReports(null);

    const formData = new FormData();
    if (imageFile && activeTab === 'upload') {
      formData.append('imageFile', imageFile);
      if (previewUrl) formData.append('previewUrl', previewUrl);
    } else if (imageUrlInput && activeTab === 'url') {
      formData.append('imageUrl', imageUrlInput);
    } else {
        setError('Please select an image or provide a URL based on the active tab.');
        setIsLoading(false);
        return;
    }

    const predictionResponse: PredictionServiceResponse = await predictDiseaseLocalAction(formData);

    if (predictionResponse.error) {
      setError(predictionResponse.error);
      setIsLoading(false);
      return;
    }

    const { groupedDetections, imageUrlToDisplay, imageNaturalWidth, imageNaturalHeight } = predictionResponse;

    if (groupedDetections && imageUrlToDisplay && imageNaturalWidth && imageNaturalHeight) {
      const reports: ProcessedDiseaseReport[] = [];
      let aiErrorOccurred = false;

      for (const detectionGroup of groupedDetections) {
        try {
          // Use static recommendations instead of AI
          const staticRecommendation = getDiseaseRecommendation(detectionGroup.diseaseName);
          
          // Format the static data as markdown
          let finalDescription = `### ${staticRecommendation.diseaseName}\n\n`;
          finalDescription += `**Description:** ${staticRecommendation.description}\n\n`;
          
          finalDescription += `**Symptoms:**\n`;
          staticRecommendation.symptoms.forEach(symptom => {
            finalDescription += `- ${symptom}\n`;
          });
          
          finalDescription += `\n**Treatment Options:**\n`;
          if (staticRecommendation.treatment.organic.length > 0) {
            finalDescription += `**Organic/Cultural Controls:**\n`;
            staticRecommendation.treatment.organic.forEach(treatment => {
              finalDescription += `- ${treatment}\n`;
            });
          }
          
          if (staticRecommendation.treatment.chemical.length > 0) {
            finalDescription += `\n**Chemical Controls:**\n`;
            staticRecommendation.treatment.chemical.forEach(treatment => {
              finalDescription += `- ${treatment}\n`;
            });
          }
          
          finalDescription += `\n**Prevention:**\n`;
          staticRecommendation.prevention.forEach(prevention => {
            finalDescription += `- ${prevention}\n`;
          });

          if (detectionGroup.diseaseName !== "Undetermined" && detectionGroup.highestConfidence < LOW_CONFIDENCE_THRESHOLD_UI) {
            const lowConfidenceMessage = `**Important Note Regarding Confidence:** The AI's confidence in diagnosing *${detectionGroup.diseaseName}* is ${Math.round(detectionGroup.highestConfidence * 100)}%, which is relatively low. For a more accurate assessment, please try again with a clearer, well-lit image focusing on the affected parts of the leaf. The information below is based on the current (low-confidence) prediction.\n\n---\n\n`;
            finalDescription = lowConfidenceMessage + finalDescription;
          }
          
          reports.push({
            ...detectionGroup,
            enhancedDescription: finalDescription,
            imageUrl: imageUrlToDisplay,
            imageNaturalWidth: imageNaturalWidth,
            imageNaturalHeight: imageNaturalHeight,
          });

        } catch (error: any) {
          console.error("Error processing " + detectionGroup.diseaseName + ":", error);
          aiErrorOccurred = true;
          // Fallback for AI error remains, but low confidence message is handled above
          const fallbackDescription = `### ${detectionGroup.diseaseName}\n**Confidence:** ${Math.round(detectionGroup.highestConfidence * 100)}%\n\n*(Automated generation of detailed information failed for this item. Please consult agricultural resources or a local expert for specific guidance on symptoms, treatment, and prevention for ${detectionGroup.diseaseName}.)*`;
          reports.push({
              ...detectionGroup,
              enhancedDescription: fallbackDescription,
              imageUrl: imageUrlToDisplay,
              imageNaturalWidth: imageNaturalWidth,
              imageNaturalHeight: imageNaturalHeight,
          });
        }
      }
      setProcessedReports(reports);
      if (aiErrorOccurred) {
         toast({
            variant: "destructive",
            title: "AI Guide Issue",
            description: "Some AI-generated guides could not be created. Displaying basic diagnosis for affected items.",
          });
      }
    // This `else if` for isHealthyOrUndetermined is implicitly handled if groupedDetections contains only "Undetermined"
    // predictDiseaseAction now ensures groupedDetections always has at least an "Undetermined" item if nothing else is found.
    } else {
        // This case should ideally not be reached if predictDiseaseAction always returns something.
        // But as a fallback:
        setError("Prediction successful, but couldn't process results for display. The image might be unsuitable or an unexpected issue occurred.");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Tabs defaultValue="upload" onValueChange={(value) => setActiveTab(value as 'upload' | 'url')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Image
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link2 className="mr-2 h-5 w-5" /> Image URL
          </TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <TabsContent value="upload" className="p-1">
            <div className="space-y-2">
              <Label htmlFor="imageFile" className="text-lg font-medium">Upload Lemon Leaf Image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                aria-describedby="fileHelp"
              />
              <p id="fileHelp" className="text-sm text-muted-foreground">Supports PNG, JPG, JPEG. Max 4MB.</p>
            </div>
          </TabsContent>
          <TabsContent value="url" className="p-1">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-lg font-medium">Or Enter Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/lemon-leaf.jpg"
                value={imageUrlInput}
                onChange={handleUrlChange}
                aria-describedby="urlHelp"
              />
              <p id="urlHelp" className="text-sm text-muted-foreground">Enter a direct link to a lemon leaf image.</p>
            </div>
          </TabsContent>

          {previewUrl && (
            <div className="mt-4 p-2 border border-dashed border-border rounded-lg bg-card">
              <p className="text-sm font-medium text-center mb-2 text-muted-foreground">Image Preview</p>
              <div className="relative w-full h-48 sm:h-64 rounded overflow-hidden">
                <Image src={previewUrl} alt="Selected lemon leaf preview" layout="fill" objectFit="contain" data-ai-hint="lemon leaf" />
              </div>
            </div>
          )}
          {!previewUrl && (
             <div className="mt-4 p-8 border border-dashed border-border rounded-lg bg-card flex flex-col items-center justify-center h-48 sm:h-64">
                <ImageIcon size={64} className="mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground/80">Your image preview will appear here</p>
            </div>
          )}

          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size={20} className="mr-2" /> Predicting...
              </>
            ) : (
              'Predict Disease'
            )}
          </Button>
        </form>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {processedReports && processedReports.length > 0 && !error && (
        <div className="mt-10 animate-fade-in">
          <PredictionResultCard reports={processedReports} />
        </div>
      )}
    </div>
  );
}
