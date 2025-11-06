const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CatalogItem {
  slug: string;
  name: string;
}

export interface Catalog {
  type: string;
  roles: CatalogItem[];
  industries: CatalogItem[];
}

export interface CategoryData {
  type: string;
  slug: string;
  name: string;
  personas: {
    buyer: string[];
    influencer: string[];
  };
  priorities: string[];
  useCases: Array<{
    name: string;
    description: string;
    solutions: Array<{
      name: string;
      links: Array<{
        type: string;
        url: string;
      }>;
    }>;
    customerEvidence: Array<{
      name: string;
      solutionPlay: string;
      storyUrl: string;
    }>;
  }>;
}

export interface InspireSettings {
  type: string;
  inspireInterests: string[];
}

export async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch(`${API_BASE_URL}/api/catalog`);
  if (!response.ok) {
    throw new Error('Failed to fetch catalog');
  }
  return response.json();
}

export async function fetchCategory(type: 'role' | 'industry', slug: string): Promise<CategoryData> {
  const response = await fetch(`${API_BASE_URL}/api/category/${type}/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} ${slug}`);
  }
  return response.json();
}

export async function fetchInspireSettings(): Promise<InspireSettings> {
  const response = await fetch(`${API_BASE_URL}/api/settings/inspire`);
  if (!response.ok) {
    throw new Error('Failed to fetch inspire settings');
  }
  return response.json();
}
