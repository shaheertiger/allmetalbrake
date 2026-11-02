export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amazonUrl: string;
  category: string;
  tagline: string;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  description: string;
  badges?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
