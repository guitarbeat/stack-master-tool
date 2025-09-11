import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { processImageWithReplicate } from '@/utils/replicateBackgroundRemoval';

const ReplicateBackgroundRemoval = () => {
  const [apiKey, setApiKey] = useState('r8_JkD7xnevUPQvp33KeR5MSp4ujWe6CfZ3bfHTy');
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<{[key: string]: string}>({});

  const imagesToProcess = [
    {
      path: 'public/lovable-uploads/7d9858d1-1f82-4b50-b3be-70cc56c38f48.png',
      name: 'Image 1'
    },
    {
      path: 'public/lovable-uploads/7e6f6389-6a87-4c5e-a2db-fe7af486956f.png', 
      name: 'Image 2'
    }
  ];

  const processImages = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Replicate API key');
      return;
    }

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
      toast.success('All images processed! You can now download them.');
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
            <div>
              <label className="block text-sm font-medium mb-2">
                Replicate API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Replicate API key"
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={processImages} 
              disabled={processing || !apiKey.trim()}
              className="w-full"
            >
              {processing ? 'Processing Images...' : 'Remove Backgrounds'}
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {imagesToProcess.map((image) => (
            <Card key={image.path} className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">{image.name}</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Original:</p>
                  <img 
                    src={`/${image.path}`} 
                    alt={image.name}
                    className="w-full h-48 object-contain bg-gray-100 rounded"
                  />
                </div>

                {processedImages[image.path] && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Background Removed:</p>
                    <img 
                      src={processedImages[image.path]} 
                      alt={`${image.name} - Background Removed`}
                      className="w-full h-48 object-contain bg-gray-100 rounded"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadImage(
                        processedImages[image.path], 
                        `${image.name.toLowerCase().replace(' ', '-')}-no-bg.png`
                      )}
                      className="w-full"
                    >
                      Download PNG
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