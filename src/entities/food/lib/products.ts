import type { Food } from './types';
import type { Nutrients } from '@/shared/db';
import { scaleNutrients } from './nutrients';

// USDA SR Legacy reference foods. Values describe the named food, not every brand.
// The basis stays per 100 g; kcal and nutrients are scaled to the displayed portion.
function product(id: string, name: string, group: NonNullable<Food['product']>['group'], amount: number, kcal: number, nutrients: Nutrients, fdcId: number, portionLabel: string, highlight: NonNullable<Food['product']>['highlight']): Food {
  return {
    photo: `${id}.webp`,
    id,
    name,
    amount,
    unit: 'g',
    kcal: Math.round(kcal * amount / 100),
    basis: { amount: 100, kcal, nutrients },
    nutrients: scaleNutrients(nutrients, amount / 100),
    category: group === 'drinks' ? 'drinks' : 'snacks',
    tags: [group === 'fruit' ? 'фрукты' : group === 'yogurt' ? 'йогурты' : group === 'drinks' ? 'напитки' : 'снеки', 'перекус'],
    product: { group, portionLabel, highlight, sourceUrl: `https://tools.myfooddata.com/nutrition-facts/${fdcId}/100g` },
  };
}

export const products: Food[] = [
  product('product-greek-yogurt', 'Греческий йогурт 0%', 'yogurt', 150, 59, { protein: 10.2, fat: 0.39, carbs: 3.6, sugars: 3.2, fiber: 0 }, 170894, 'Стаканчик · 150 г', 'protein'),
  product('product-banana', 'Банан', 'fruit', 120, 89, { protein: 1.09, fat: 0.33, carbs: 22.84, sugars: 12.23, fiber: 2.6 }, 173944, 'Один без кожуры · 120 г', 'fiber'),
  product('product-apple', 'Яблоко', 'fruit', 180, 52, { protein: 0.26, fat: 0.17, carbs: 13.81, sugars: 10.39, fiber: 2.4 }, 171688, 'Одно яблоко · 180 г', 'fiber'),
  product('product-almonds', 'Миндаль', 'snacks', 30, 579, { protein: 21.15, fat: 49.93, carbs: 21.55, sugars: 4.35, fiber: 12.5 }, 170567, 'Горсть · 30 г', 'protein'),
  product('product-dark-chocolate', 'Шоколад 70–85%', 'snacks', 20, 598, { protein: 7.79, fat: 42.63, carbs: 45.9, sugars: 24.23, fiber: 10.9 }, 170273, 'Две дольки · 20 г', 'sugars'),
  product('product-black-coffee', 'Чёрный кофе', 'drinks', 200, 1, { protein: 0.12, fat: 0.02, carbs: 0, sugars: 0, fiber: 0 }, 171890, 'Чашка · 200 г', 'sugars'),
];
