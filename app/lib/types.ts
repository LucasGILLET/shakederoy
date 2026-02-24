export interface Ingredient {
  id?: string;
  name: string;
  amount: string;
  isAlcoholic?: boolean;
}

export interface CocktailCardModel {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  duration: string;
  alcohol: boolean;
  image: string | null;
  tags: string[];
  variantOfId?: string | null;
}

export interface CocktailDetailsModel extends CocktailCardModel {
  intensity: number | null;
  prepTime: number | null;
  styles: string[];
  ingredients: Ingredient[];
  steps: string[];
  preparationSteps: Array<{
    id: string;
    stepNumber: number;
    description: string;
    imageUrl: string | null;
  }>;
  photos: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }>;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  profile_pic: string | null;
}
