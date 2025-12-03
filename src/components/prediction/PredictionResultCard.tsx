
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import type { ProcessedDiseaseReport, DetectionInstance } from '@/types/index';
import { CheckCircle, AlertTriangle, Sparkles, Leaf } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface PredictionResultCardProps {
  reports: ProcessedDiseaseReport[];
}

function getDiseaseStatus(diseaseName: string, confidence: number): { Icon: React.ElementType, label: string } {
  const lowerDiseaseName = diseaseName.toLowerCase();
  const formattedDiseaseName = diseaseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (lowerDiseaseName.includes('healthy')) {
    return { Icon: CheckCircle, label: "Healthy" };
  }
  if (lowerDiseaseName.includes('undetermined')) {
    return { Icon: Leaf, label: "Undetermined" };
  }
  if (confidence < 0.5) {
    return { Icon: AlertTriangle, label: `Possible: ${formattedDiseaseName}` };
  }
  return { Icon: AlertTriangle, label: formattedDiseaseName };
}

const diseaseColors = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(0 84.2% 60.2%)', // Destructive color for high-sev issues
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];


export function PredictionResultCard({ reports }: PredictionResultCardProps) {
  const [imgContainerSize, setImgContainerSize] = useState<{width: number, height: number} | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  
  const defaultAccordionValues = reports.map(report => report.diseaseName);


  useEffect(() => {
    const calculateSize = () => {
      if (imgContainerRef.current) {
        setImgContainerSize({
          width: imgContainerRef.current.offsetWidth,
          height: imgContainerRef.current.offsetHeight,
        });
      }
    };

    calculateSize(); 
    window.addEventListener('resize', calculateSize); 

    const imageLoadTimeout = setTimeout(calculateSize, 200);


    return () => {
      window.removeEventListener('resize', calculateSize);
      clearTimeout(imageLoadTimeout);
    };
  }, [reports]); 

  if (!reports || reports.length === 0) {
    return null;
  }

  const commonImageUrl = reports[0].imageUrl;
  const commonImageNaturalWidth = reports[0].imageNaturalWidth;
  const commonImageNaturalHeight = reports[0].imageNaturalHeight;

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in shadow-xl">
      <CardHeader className="pb-2 text-center">
        <h2 className="text-3xl font-bold text-primary font-headline">Diagnosis Results</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {commonImageUrl && commonImageNaturalWidth && commonImageNaturalHeight && (
          <div ref={imgContainerRef} className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-border bg-card">
            <Image
              src={commonImageUrl}
              alt="Analyzed lemon leaf"
              layout="fill"
              objectFit="contain"
              data-ai-hint="lemon leaf analysis"
              priority={true}
              onLoadingComplete={() => {
                 setTimeout(() => {
                    if (imgContainerRef.current) {
                        setImgContainerSize({
                            width: imgContainerRef.current.offsetWidth,
                            height: imgContainerRef.current.offsetHeight,
                        });
                    }
                }, 100);
              }}
            />
            {imgContainerSize && reports.map((report, reportIndex) => {
              const isSpecialCase = report.diseaseName.toLowerCase().includes('healthy') || report.diseaseName.toLowerCase().includes('undetermined');
              if (isSpecialCase) return null;

              const itemColor = diseaseColors[reportIndex % diseaseColors.length];
              const formattedDiseaseName = report.diseaseName
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return report.instances.map((instance: DetectionInstance, instanceIndex: number) => {
                const { x: centerX, y: centerY, width: boxWidth, height: boxHeight } = instance;
                
                const aspectRatio = commonImageNaturalWidth / commonImageNaturalHeight;
                let displayWidth = imgContainerSize.width;
                let displayHeight = imgContainerSize.width / aspectRatio;

                if (displayHeight > imgContainerSize.height) {
                  displayHeight = imgContainerSize.height;
                  displayWidth = imgContainerSize.height * aspectRatio;
                }
                
                const offsetX = (imgContainerSize.width - displayWidth) / 2;
                const offsetY = (imgContainerSize.height - displayHeight) / 2;

                const scaleX = displayWidth / commonImageNaturalWidth;
                const scaleY = displayHeight / commonImageNaturalHeight;

                const boxLeftNatural = centerX - boxWidth / 2;
                const boxTopNatural = centerY - boxHeight / 2;

                const displayBoxLeft = boxLeftNatural * scaleX + offsetX;
                const displayBoxTop = boxTopNatural * scaleY + offsetY;
                const displayBoxWidth = boxWidth * scaleX;
                const displayBoxHeight = boxHeight * scaleY;

                return (
                  <React.Fragment key={`${report.diseaseName}-${instanceIndex}`}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${displayBoxLeft}px`,
                        top: `${displayBoxTop}px`,
                        width: `${displayBoxWidth}px`,
                        height: `${displayBoxHeight}px`,
                        border: `3px solid ${itemColor}`,
                        boxShadow: `0 0 8px ${itemColor}B3`, 
                        borderRadius: '2px',
                      }}
                      title={`${formattedDiseaseName} (Confidence: ${Math.round(instance.confidence * 100)}%)`}
                      aria-label={`Detected area for ${formattedDiseaseName}`}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${displayBoxLeft}px`,
                        top: `${displayBoxTop}px`,
                        transform: 'translateY(-100%)', // Position above the box
                        backgroundColor: itemColor,
                        color: '#ffffff',
                        padding: '2px 5px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formattedDiseaseName}
                    </div>
                  </React.Fragment>
                );
              })
            })}
          </div>
        )}

        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
          {reports.map((report, reportIndex) => {
            const { diseaseName, highestConfidence } = report;
            const { Icon, label } = getDiseaseStatus(diseaseName, highestConfidence);
            const confidencePercentage = Math.round(highestConfidence * 100);

            const isHealthy = diseaseName.toLowerCase().includes('healthy');
            const isUndetermined = diseaseName.toLowerCase().includes('undetermined');
            const isLowConfidence = highestConfidence < 0.5 && !isHealthy && !isUndetermined;

            let itemColor: string;
            if (isHealthy || isUndetermined) {
              itemColor = 'hsl(var(--primary))';
            } else if (isLowConfidence) {
              itemColor = 'hsl(var(--accent))';
            } else {
              itemColor = diseaseColors[reportIndex % diseaseColors.length];
            }

            return (
              <AccordionItem value={report.diseaseName} key={report.diseaseName} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="py-4 px-2 hover:bg-secondary/30 rounded-md group">
                  <div className="flex items-center space-x-3 w-full">
                    <Icon size={28} style={{color: itemColor}} />
                    <span className="text-xl font-headline" style={{color: itemColor}}>{label}</span>
                    {report.diseaseName.toLowerCase() !== 'undetermined' && (
                        <span className="ml-auto text-sm text-muted-foreground group-hover:text-foreground">
                            (Highest Confidence: {confidencePercentage}%)
                        </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-2 space-y-4">
                   {report.diseaseName.toLowerCase() !== 'undetermined' && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-foreground">Overall Confidence</p>
                          <p className="text-lg font-semibold" style={{color: itemColor}}>{confidencePercentage}%</p>
                        </div>
                        <Progress 
                            value={confidencePercentage} 
                            aria-label={`Confidence: ${confidencePercentage}%`}
                            indicatorStyle={{ backgroundColor: itemColor }}
                        />
                    </div>
                   )}
                  
                  <div className="space-y-2 p-4 bg-card rounded-lg border border-border shadow-inner">
                      <div className="flex items-center space-x-2 text-primary mb-2">
                        <Sparkles size={20} />
                        <h3 className="text-lg font-semibold">AI-Generated Guide</h3>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-3 text-primary" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold my-2 text-primary/90" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-foreground" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-outside pl-5 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-5 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="pb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            a: ({node, ...props}) => <a className="text-accent hover:underline" {...props} />,
                          }}
                        >
                          {report.enhancedDescription}
                        </ReactMarkdown>
                      </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
