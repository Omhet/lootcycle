export type EquipmentFix = {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
};
export type Upgrade = {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
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
