import { processImageWithReplicate } from './replicateBackgroundRemoval';

const API_KEY = 'r8_JkD7xnevUPQvp33KeR5MSp4ujWe6CfZ3bfHTy';

export async function processAndSaveImages() {
  const imagesToProcess = [
    {
      path: 'lovable-uploads/7d9858d1-1f82-4b50-b3be-70cc56c38f48.png',
      outputName: 'icc-logo-no-bg.png'
    },
    {
      path: 'lovable-uploads/7e6f6389-6a87-4c5e-a2db-fe7af486956f.png', 
      outputName: 'community-badge-no-bg.png'
    }
  ];

  const results = [];

  for (const image of imagesToProcess) {
    try {
      console.log(`Processing ${image.path}...`);
      const resultUrl = await processImageWithReplicate(image.path, API_KEY);
      
      // Download the processed image
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      
      results.push({
        originalPath: image.path,
        outputName: image.outputName,
        blob: blob,
        url: resultUrl
      });
      
      console.log(`Successfully processed ${image.path}`);
    } catch (error) {
      console.error(`Failed to process ${image.path}:`, error);
    }
  }

  return results;
}