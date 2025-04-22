import s from "./Shop.module.css";
import { useState } from "react";
import { RecipeCategory, RecipeItem } from "./types";

type RecipesTabProps = {
    recipes: RecipeCategory[];
    balance: number;
    onBuy: (purchaseItemId: string) => void;
    onClose: () => void;
};

export const RecipesTab = ({
    recipes,
    balance,
    onBuy,
    onClose,
}: RecipesTabProps) => {
    const [selectedItem, setSelectedItem] = useState<RecipeItem>(
        recipes[0].items[0]
    );

    return (
        <div className={s.tabContainer}>
            <div className={s.recipeCategoriesContainer}>
                {recipes.map((category) => (
                    <div key={category.name} className={s.category}>
                        <span className={s.categoryTitle}>{category.name}</span>
                        <div className={s.itemsContainer}>
                            {category.items.map((item) => (
                                <div
                                    key={item.name}
                                    className={`${s.item} ${
                                        selectedItem.id === item.id
                                            ? s.active
                                            : ""
                                    }`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className={s.itemImage}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button className={s.button} onClick={onClose}>
                    I gol all I need, thanks!
                </button>
            </div>
            <div className={s.recipeDetailsContainer}>
                <div className={s.recipeTitleContainer}>
                    <span className={s.recipeName}>{selectedItem.name}</span>
                    <span className={s.recipeCategory}>
                        {selectedItem.category} recipe
                    </span>
                </div>
                <span className={s.recipeDescription}>
                    {selectedItem.description}
                    <br />
                    <br />
                    You'll make {selectedItem.priceForCraftedBaseItem} gold if
                    you craft the basic configuration
                </span>
                {selectedItem.alreadyBought && (
                    <span className={s.buttonReplacement}>Already have it</span>
                )}
                {!selectedItem.alreadyBought &&
                    selectedItem.price > balance && (
                        <span className={s.buttonReplacement}>
                            Not enough gold {selectedItem.price}
                        </span>
                    )}
                {!selectedItem.alreadyBought &&
                    selectedItem.price <= balance && (
                        <button
                            className={s.button}
                            onClick={() => onBuy(selectedItem.id)}
                        >
                            Buy {selectedItem.price}
                        </button>
                    )}
            </div>
        </div>
    );
};
