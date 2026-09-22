import type { Food } from './types';

export const foods: Food[] = [
  {
    id: 'thai-salmon-noodles',
    name: 'Лосось с тайской лапшой',
    kcal: 517,
    nutrients: { protein: 36, fat: 22, carbs: 39, fiber: 8 },
    photo: 'thai-salmon-noodles.webp',
    category: 'meals',
    tags: ['рыба', 'лосось', 'лапша', 'ужин', 'быстро', 'белок'],
    recipe: {
      summary: 'Тёплый лосось, рисовая лапша и хрустящие овощи в яркой цитрусовой заправке.',
      timeMinutes: 20,
      difficulty: 'Легко',
      servings: 2,
      collections: ['high-protein', 'quick', 'balanced'],
      ingredients: ['2 филе лосося без кожи', '75 г рисовой лапши', '125 г стручковой фасоли', '75 г зелёного горошка', '1 апельсин', 'Красная карри-паста и зелень'],
      steps: ['Приготовь лосось на пару вместе с фасолью и горошком.', 'Залей лапшу горячей водой на 5 минут.', 'Смешай сок апельсина, карри-пасту и зелень, затем собери салат.'],
      sourceName: 'Good Food',
      sourceUrl: 'https://www.bbcgoodfood.com/recipes/fresh-salmon-thai-noodle-salad',
    },
  },
  {
    id: 'tuna-lettuce-wraps',
    name: 'Роллы с тунцом и авокадо',
    kcal: 361,
    nutrients: { protein: 40, fat: 17, carbs: 8, fiber: 8 },
    photo: 'tuna-lettuce-wraps.webp',
    category: 'meals',
    tags: ['тунец', 'авокадо', 'обед', 'без глютена', 'мало углеводов'],
    recipe: {
      summary: 'Хрустящие листья салата вместо тортильи, тунец и кремовый соус из авокадо.',
      timeMinutes: 17,
      difficulty: 'Легко',
      servings: 2,
      collections: ['high-protein', 'under-400', 'quick', 'balanced'],
      ingredients: ['2 филе тунца по 140 г', '1 спелый авокадо', '8 листьев романо', '16 томатов черри', 'Горчица, каперсы и яблочный уксус'],
      steps: ['Обжарь тунца по минуте с каждой стороны и дай ему отдохнуть.', 'Разомни авокадо с горчицей, уксусом и каперсами.', 'Разложи соус, тунец и томаты по листьям салата и сверни.'],
      sourceName: 'Good Food',
      sourceUrl: 'https://www.bbcgoodfood.com/recipes/tuna-mayo-wraps/',
    },
  },
  {
    id: 'tamarind-prawn-curry',
    name: 'Карри с креветками и тамариндом',
    kcal: 403,
    nutrients: { protein: 21, fat: 9, carbs: 56, fiber: 5 },
    photo: 'tamarind-prawn-curry.webp',
    category: 'meals',
    tags: ['креветки', 'карри', 'рис', 'ужин', 'быстро'],
    recipe: {
      summary: 'Кисло-пряный томатный карри с сочными креветками и ароматным басмати.',
      timeMinutes: 20,
      difficulty: 'Легко',
      servings: 2,
      collections: ['quick', 'balanced'],
      ingredients: ['250 г королевских креветок', '250 г готового басмати', '400 г томатов черри', '1 луковица и 1 перец чили', 'Тамаринд, имбирь, куркума и кориандр'],
      steps: ['Обжарь лук, чили, чеснок и имбирь до мягкости.', 'Добавь специи и томаты, туши до густого соуса.', 'Вмешай тамаринд и креветки, готовь ещё 2–3 минуты и подай с рисом.'],
      sourceName: 'Good Food',
      sourceUrl: 'https://www.bbcgoodfood.com/recipes/tamarind-prawn-curry',
    },
  },
  {
    id: 'chicken-chickpea-bowl',
    name: 'Боул с курицей и нутом',
    kcal: 540,
    nutrients: { protein: 30, fat: 25, carbs: 50, fiber: 10 },
    photo: 'chicken-chickpea-bowl.webp',
    category: 'meals',
    tags: ['курица', 'нут', 'боул', 'обед', 'белок'],
    recipe: {
      summary: 'Пряная курица, хрустящий нут, свежие овощи и лимонно-тахинная заправка.',
      timeMinutes: 30,
      difficulty: 'Легко',
      servings: 2,
      collections: ['high-protein', 'balanced'],
      ingredients: ['300 г куриной грудки', '240 г готового нута', 'Салат, томаты и красный лук', '2 ст. л. тахини', 'Лимон, чеснок, паприка и кумин'],
      steps: ['Приправь и обжарь курицу до золотистой корочки.', 'Подрумянь нут со специями на той же сковороде.', 'Собери боул с овощами и полей лимонно-тахинной заправкой.'],
      sourceName: 'Craving Cooks',
      sourceUrl: 'https://cravingcooks.com/recipes/Spiced-Chicken-and-Chickpea-Bowls-with-Lemon-Tahini-Dressing',
    },
  },
  {
    id: 'chicken-pasta-prep',
    name: 'Паста с курицей и брокколи',
    kcal: 475,
    nutrients: { protein: 47, fat: 10, carbs: 45, fiber: 7 },
    photo: 'chicken-pasta-prep.webp',
    category: 'meals',
    tags: ['курица', 'паста', 'брокколи', 'обед', 'заготовка'],
    recipe: {
      summary: 'Сытная паста с куриной грудкой, брокколи и шпинатом — удобно готовить заранее.',
      timeMinutes: 30,
      difficulty: 'Легко',
      servings: 4,
      collections: ['high-protein', 'balanced'],
      ingredients: ['320 г пасты пенне', '450 г куриной грудки', '1 кочан брокколи', '2 горсти шпината', 'Вяленые томаты и пармезан'],
      steps: ['Отвари пасту и брокколи до состояния al dente.', 'Обжарь кусочки курицы до готовности.', 'Соедини всё со шпинатом, томатами и лёгким сливочным соусом.'],
      sourceName: 'Good Food / Stephanie Kay Nutrition',
      sourceUrl: 'https://kaynutrition.com/chicken-pasta-meal-prep/',
    },
  },
  {
    id: 'chicken-avocado-wrap',
    name: 'Острый ролл с курицей и авокадо',
    kcal: 403,
    nutrients: { protein: 29, fat: 16, carbs: 32, fiber: 7 },
    photo: 'chicken-avocado-wrap.webp',
    category: 'meals',
    tags: ['курица', 'авокадо', 'ролл', 'обед', 'быстро'],
    recipe: {
      summary: 'Сочная пряная курица, авокадо и свежие овощи в мягкой тортилье.',
      timeMinutes: 35,
      difficulty: 'Легко',
      servings: 2,
      collections: ['high-protein', 'balanced'],
      ingredients: ['2 цельнозерновые тортильи', '250 г куриной грудки', '1 авокадо', 'Салат, томаты и красный лук', 'Греческий йогурт, лайм и острый соус'],
      steps: ['Обжарь приправленную курицу и нарежь полосками.', 'Смешай йогурт, лайм и острый соус.', 'Разложи начинку по тортильям, добавь соус и плотно сверни.'],
      sourceName: 'Good Food / Dash and Dishes',
      sourceUrl: 'https://dashanddishes.com/recipes/spicy-chicken-avocado-wraps',
    },
  },
];

const byId = new Map(foods.map(food => [food.id, food]));

export function foodById(id: string): Food | undefined {
  return byId.get(id);
}

export function photoUrl(food: Food): string {
  return `/foods/${food.photo}`;
}

export const activeFoods: Food[] = foods.filter(food => !food.archived);

export function matchesQuery(food: { name: string; tags?: string[] }, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return food.name.toLowerCase().includes(needle)
    || food.tags?.some(tag => tag.toLowerCase().includes(needle)) === true;
}

export function searchFoods(query: string, category?: string): Food[] {
  return activeFoods.filter(food => (
    (!category || food.category === category) && matchesQuery(food, query)
  ));
}
