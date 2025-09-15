import { MarketingData, ApiResponse } from '../types/marketing';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || ''
  : 'http://localhost:3002';

export async function fetchMarketingData(): Promise<MarketingData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/marketing-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for development
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MarketingData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching marketing data:', error);
    throw new Error(`Failed to fetch marketing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Client-side fetch function for use in components
export async function fetchMarketingDataClient(): Promise<MarketingData> {
  try {
    const response = await fetch('/api/marketing-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ApiResponse = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: MarketingData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching marketing data:', error);
    throw error;
  }
}
