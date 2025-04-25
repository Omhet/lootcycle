import { useState } from "react";
import s from "./Shop.module.css";
import { Upgrade } from "./types";

type UpgradesTabProps = {
  upgrades: Upgrade[];
  balance: number;
  onBuy: (purchaseItemId: string) => void;
  onClose: () => void;
};

export const UpgradesTab = ({ upgrades, balance, onBuy, onClose }: UpgradesTabProps) => {
  const [purchaseCounter, setPurchaseCounter] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Upgrade>(upgrades[0]);

  if (!selectedItem || upgrades.length === 0) {
    return (
      <div className={s.tabContainer}>
        <div className={s.itemsContainer}>
          <span>No upgrades available</span>
          <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleBuy = (itemId: string) => {
    setPurchaseCounter((prev) => prev + 1); // Increment the purchase counter
    onBuy(itemId); // Call the onBuy function with the item ID
  };

  return (
    <div className={s.tabContainer}>
      <div className={s.itemsSection}>
        <div className={s.itemsContainer}>
          {upgrades.map((item) => (
            <div key={item.id} className={`${s.item} ${selectedItem.id === item.id ? s.active : ""}`} onClick={() => setSelectedItem(item)}>
              <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
            </div>
          ))}
        </div>
        <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
          I got all I need, thanks!
        </button>
      </div>
      <div className={s.recipeDetailsContainer} key={purchaseCounter}>
        <div className={s.recipeTitleContainer}>
          <span className={s.recipeName}>{selectedItem.name}</span>
        </div>
        <span className={s.recipeDescription}>{selectedItem.description}</span>
        {selectedItem.alreadyBought ? (
          <div className={s.alreadyBought}>Already purchased</div>
        ) : (
          <button className={`${s.button} ${s.buyButton}`} onClick={() => handleBuy(selectedItem.id)} disabled={selectedItem.price > balance}>
            {selectedItem.price > balance ? "Not enough money" : "Buy"} ({selectedItem.price}
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />)
          </button>
        )}
      </div>
    </div>
  );
};
