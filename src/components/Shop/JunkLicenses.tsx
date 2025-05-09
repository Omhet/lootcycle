import { useState } from "react";
import s from "./Shop.module.css";
import { JunkLicense } from "./types";

type JunkLicenseTabProps = {
  junkLicenses: JunkLicense[];
  balance: number;
  onBuy: (purchaseItemId: string) => void;
  onClose: () => void;
};

export const JunkLicensesTab = ({ junkLicenses, balance, onBuy, onClose }: JunkLicenseTabProps) => {
  const [selectedItem, setSelectedItem] = useState<JunkLicense>(junkLicenses[0]);

  if (!selectedItem || junkLicenses.length === 0) {
    return (
      <div className={s.tabContainer}>
        <div className={s.itemsContainer}>
          <span>No junk licenses available</span>
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
        <div className={s.itemsContainer}>
          {junkLicenses.map((item) => (
            <div key={item.name} className={`${s.item} ${selectedItem.id === item.id ? s.active : ""}`} onClick={() => setSelectedItem(item)}>
              <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
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
        </div>
        <div className={s.recipeDescription} dangerouslySetInnerHTML={{ __html: selectedItem.description || "" }} />
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
