export type JunkLicense = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description?: string;
  alreadyBought: boolean;
};

export type Upgrade = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description?: string;
  value: number;
  upgradeType: string;
  level: number;
  alreadyBought: boolean;
};

export type RecipeCategory = {
  name: string;
  items: RecipeItem[];
};

export type RecipeItem = {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageUrl: string;
  price: number;
  priceForCraftedBaseItem: number;
  alreadyBought: boolean;
};
