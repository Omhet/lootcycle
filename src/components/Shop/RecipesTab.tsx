import { useState } from "react";
import s from "./Shop.module.css";
import { RecipeCategory, RecipeItem } from "./types";

type RecipesTabProps = {
  recipes: RecipeCategory[];
  balance: number;
  onBuy: (purchaseItemId: string) => void;
  onClose: () => void;
};

export const RecipesTab = ({ recipes, balance, onBuy, onClose }: RecipesTabProps) => {
  const [selectedItem, setSelectedItem] = useState<RecipeItem>(recipes[0]?.items[0] || null);

  if (!selectedItem || recipes.length === 0) {
    return (
      <div className={s.tabContainer}>
        <div className={s.itemsContainer}>
          <span>No recipes available</span>
          <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.tabContainer}>
      <div className={s.recipeCategoriesContainer}>
        {recipes.map((category) => (
          <div key={category.name} className={s.category}>
            <span className={s.categoryTitle}>{category.name}</span>
            <div className={s.itemsContainer}>
              {category.items.map((item) => (
                <div key={item.name} className={`${s.item} ${selectedItem.id === item.id ? s.active : ""}`} onClick={() => setSelectedItem(item)}>
                  <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
          I got all I need, thanks!
        </button>
      </div>
      <div className={s.recipeDetailsContainer}>
        <div className={s.recipeTitleContainer}>
          <span className={s.recipeName}>{selectedItem.name}</span>
          <span className={s.recipeCategory}>{selectedItem.category} recipe</span>
        </div>
        <span className={s.recipeDescription}>
          {selectedItem.description}
          <br />
          <br />
          You'll make {selectedItem.priceForCraftedBaseItem} gold if you craft the basic configuration
        </span>
        {selectedItem.alreadyBought ? (
          <div className={s.alreadyBought}>Already purchased</div>
        ) : (
          <button className={`${s.button} ${s.buyButton}`} onClick={() => onBuy(selectedItem.id)} disabled={selectedItem.price > balance}>
            Buy {selectedItem.price}
          </button>
        )}
      </div>
    </div>
  );
};
