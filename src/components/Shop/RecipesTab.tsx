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

  const handleBuy = (itemId: string) => {
    onBuy(itemId); // Call the onBuy function with the item ID
    setSelectedItem((prev) => ({ ...prev, alreadyBought: true })); // Update the selected item to reflect the purchase
  };

  return (
    <div className={s.tabContainer}>
      <div className={s.itemsSection}>
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
        </div>
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
          <button className={`${s.button} ${s.buyButton}`} onClick={() => handleBuy(selectedItem.id)} disabled={selectedItem.price > balance}>
            {selectedItem.price > balance ? "Not enough money" : "Buy"} ({selectedItem.price}
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />){" "}
          </button>
        )}
      </div>
    </div>
  );
};
