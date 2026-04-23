export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  popular: boolean;
  imageUrl: string;
  category: FoodCategory;
  baked: boolean;
  ingredients: string[];
}

export enum FoodCategory {
  NIGIRI = "NIGIRI",
  MAKI = "MAKI",
  URAMAKI = "URAMAKI",
  STARTERS = "STARTERS",
  COMBO = "COMBO",
  OTHER = "OTHER",
}
