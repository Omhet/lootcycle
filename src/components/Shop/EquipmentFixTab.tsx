import s from "./Shop.module.css";
import { useState } from "react";
import { EquipmentFix } from "./types";

type EquipmentFixTabProps = {
    equipmentFixes: EquipmentFix[];
    balance: number;
    onBuy: (purchaseItemId: string) => void;
    onClose: () => void;
};

export const EquipmentFixTab = ({
    equipmentFixes,
    balance,
    onBuy,
    onClose,
}: EquipmentFixTabProps) => {
    const [selectedItem, setSelectedItem] = useState<EquipmentFix>(
        equipmentFixes[0]
    );

    return (
        <div className={s.tabContainer}>
            <div className={s.itemsContainer}>
                {equipmentFixes.map((item) => (
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
                        Fix {selectedItem.price}
                    </button>
                )}
            </div>
        </div>
    );
};
