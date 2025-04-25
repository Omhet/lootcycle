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

  return (
    <div className={s.tabContainer}>
      <div className={s.itemsContainer}>
        {upgrades.map((item) => (
          <div key={item.id} className={`${s.item} ${selectedItem.id === item.id ? s.active : ""}`} onClick={() => setSelectedItem(item)}>
            <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
          </div>
        ))}
        <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
          I got all I need, thanks!
        </button>
      </div>
      <div className={s.recipeDetailsContainer}>
        <div className={s.recipeTitleContainer}>
          <span className={s.recipeName}>{selectedItem.name}</span>
        </div>
        <span className={s.recipeDescription}>{selectedItem.description}</span>
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
