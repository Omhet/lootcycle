import s from "./Shop.module.css";
import { useState } from "react";
import { Upgrade } from "./types";

type UpgradesTabProps = {
    upgrades: Upgrade[];
    balance: number;
    onBuy: (purchaseItemId: string) => void;
    onClose: () => void;
};

export const UpgradesTab = ({
    upgrades,
    balance,
    onBuy,
    onClose,
}: UpgradesTabProps) => {
    const [selectedItem, setSelectedItem] = useState<Upgrade>(upgrades[0]);

    return (
        <div className={s.tabContainer}>
            <div className={s.itemsContainer}>
                {upgrades.map((item) => (
                    <div
                        key={item.name}
                        className={`${s.item} ${
                            selectedItem.id === item.id ? s.active : ""
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
                <button className={s.button} onClick={onClose}>
                    I gol all I need, thanks!
                </button>
            </div>
            <div className={s.recipeDetailsContainer}>
                <div className={s.recipeTitleContainer}>
                    <span className={s.recipeName}>{selectedItem.name}</span>
                </div>
                <span className={s.recipeDescription}>
                    {selectedItem.description}
                </span>
                {selectedItem.price > balance && (
                    <span className={s.buttonReplacement}>
                        Not enough gold {selectedItem.price}
                    </span>
                )}
                {selectedItem.price <= balance && (
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
