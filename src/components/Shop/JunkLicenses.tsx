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

  return (
    <div className={s.tabContainer}>
      <div className={s.itemsContainer}>
        {junkLicenses.map((item) => (
          <div key={item.name} className={`${s.item} ${selectedItem.id === item.id ? s.active : ""}`} onClick={() => setSelectedItem(item)}>
            <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
          </div>
        ))}
        <button className={s.button} onClick={onClose}>
          I got all I need, thanks!
        </button>
      </div>
      <div className={s.recipeDetailsContainer}>
        <div className={s.recipeTitleContainer}>
          <span className={s.recipeName}>{selectedItem.name}</span>
        </div>
        <div className={s.recipeDescription} dangerouslySetInnerHTML={{ __html: selectedItem.description || "" }} />
        {selectedItem.price > balance && <span className={s.buttonReplacement}>Not enough gold {selectedItem.price}</span>}
        {selectedItem.price <= balance && !selectedItem.alreadyBought && (
          <button className={s.button} onClick={() => onBuy(selectedItem.id)}>
            Buy {selectedItem.price}
          </button>
        )}
        {selectedItem.alreadyBought && <span className={s.buttonReplacement}>Already purchased</span>}
      </div>
    </div>
  );
};
