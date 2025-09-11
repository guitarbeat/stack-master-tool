import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { processImageWithReplicate } from '@/utils/replicateBackgroundRemoval';

const ReplicateBackgroundRemoval = () => {
  const apiKey = 'r8_JkD7xnevUPQvp33KeR5MSp4ujWe6CfZ3bfHTy';
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<{[key: string]: string}>({});

  const imagesToProcess = [
    {
      path: 'lovable-uploads/7d9858d1-1f82-4b50-b3be-70cc56c38f48.png',
      name: 'ICC Austin Logo',
      outputName: 'icc-logo-no-bg.png'
    },
    {
      path: 'lovable-uploads/7e6f6389-6a87-4c5e-a2db-fe7af486956f.png', 
      name: 'Community Badge',
      outputName: 'community-badge-no-bg.png'
    }
  ];

  const processImages = async () => {
    setProcessing(true);
    const newProcessedImages: {[key: string]: string} = {};

    try {
      for (const image of imagesToProcess) {
        toast.info(`Processing ${image.name}...`);
        
        const processedUrl = await processImageWithReplicate(image.path, apiKey);
        newProcessedImages[image.path] = processedUrl;
        
        toast.success(`${image.name} processed successfully!`);
      }
      
      setProcessedImages(newProcessedImages);
      toast.success('All images processed! Ready to update site.');
    } catch (error) {
      console.error('Processing failed:', error);
      toast.error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Background Removal with Replicate</h1>
        
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Processing images with Replicate API to remove backgrounds for the site.
            </p>
            
            <Button 
              onClick={processImages} 
              disabled={processing}
              className="w-full"
            >
              {processing ? 'Processing Images...' : 'Process Site Images'}
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {imagesToProcess.map((image) => (
            <Card key={image.path} className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">{image.name}</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Original (preview removed)</p>
                  <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image preview</div>
                </div>

                {processedImages[image.path] && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Background Removed (preview removed)</p>
                    <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image preview</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadImage(
                        processedImages[image.path], 
                        image.outputName
                      )}
                      className="w-full"
                    >
                      Download {image.outputName}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReplicateBackgroundRemoval;