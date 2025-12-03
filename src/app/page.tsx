import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ImageUploadForm } from '@/components/prediction/ImageUploadForm';
import { Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4 font-headline">
            Lemon Leaf Disease Detection
          </h2>
          <p className="text-lg sm:text-xl text-foreground max-w-3xl mx-auto">
            Upload an image of a lemon leaf or provide an image URL. Our AI will analyze it and predict potential diseases, helping you keep your lemon trees healthy.
          </p>
        </section>
        
        <ImageUploadForm />

        <section className="mt-16 py-12">
          <Card className="max-w-3xl mx-auto text-center p-6 sm:p-10 shadow-lg rounded-lg">
            <Leaf size={64} className="mx-auto text-primary mb-6" />
            <h3 className="text-3xl font-bold text-primary mb-4 font-headline">Why Use LemonLeaf.AI?</h3>
            <p className="text-foreground mb-3 text-lg">
              Early detection of plant diseases is crucial for effective treatment and preventing spread. LemonLeaf.AI provides a quick and accessible way to get an initial assessment of your lemon tree's health.
            </p>
            <p className="text-sm text-muted-foreground">
              Please note: This tool is for informational purposes only and should not replace professional agricultural advice. Always consult with a plant pathology expert for definitive diagnosis and treatment.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
