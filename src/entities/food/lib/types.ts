import type { CategoryId } from './categories';
import type { Basis, Grades, Nutrients, Unit } from '@/shared/db';

export interface Food {
  id: string;
  name: string;
  kcal: number;
  amount?: number;
  unit?: Unit;
  basis?: Basis;
  nutrients?: Nutrients;
  grades?: Grades;
  photo?: string;
  category: CategoryId;
  tags?: string[];
  archived?: boolean;
  product?: {
    group: 'yogurt' | 'fruit' | 'snacks' | 'drinks';
    portionLabel: string;
    highlight: 'protein' | 'fiber' | 'sugars';
    sourceUrl: string;
  };
  recipe?: {
    summary: string;
    timeMinutes: number;
    difficulty: 'Легко' | 'Средне';
    servings: number;
    collections: ('high-protein' | 'under-400' | 'quick' | 'balanced')[];
    ingredients: string[];
    steps: string[];
    sourceName: string;
    sourceUrl: string;
  };
}

export type Portion = Pick<Food, 'id' | 'name' | 'kcal' | 'amount' | 'unit' | 'basis' | 'nutrients' | 'grades'>;
