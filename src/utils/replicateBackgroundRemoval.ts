export interface ReplicateResponse {
  id: string;
  status: string;
  output?: string;
  error?: string;
}

export class ReplicateService {
  private apiKey: string;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async removeBackground(imageUrl: string): Promise<string> {
    try {
      // Create prediction
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
          input: {
            image: imageUrl
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      return this.pollForCompletion(prediction.id);
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }

  private async pollForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'succeeded' && result.output) {
        return result.output;
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Background removal failed');
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Background removal timed out');
  }
}

export async function processImageWithReplicate(imagePath: string, apiKey: string): Promise<string> {
  const service = new ReplicateService(apiKey);
  
  // Convert local path to full URL for the API
  const imageUrl = `${window.location.origin}/${imagePath}`;
  
  return service.removeBackground(imageUrl);
}