import { useState } from "react";
import { LootDescription } from "../LootDescription/LootDescription";
import s from "./Stall.module.css";

type StallGroup = {
  name: string;
  items: StallLootItem[];
};
type StallLootItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  lootDetails: StallLootDetail[];
};

type StallLootDetail = {
  lootDetailName: string;
  junkImageUrl: string;
};

type StallProps = {
  groups: StallGroup[];
  onSellAndClose: () => void;
};

export const Stall = ({ groups, onSellAndClose }: StallProps) => {
  const [highlightedLootItem, setHighlightedLootItem] = useState<StallLootItem>(groups[0].items[0]);

  const totalProfit = groups.reduce((total, group) => total + group.items.reduce((groupTotal, item) => groupTotal + item.price, 0), 0);

  return (
    <div className={s.stallContainer}>
      <div className={s.stall}>
        <div className={s.stallHeader}>
          <span className={s.stallHeaderTitle}>Stall</span>
          <span className={s.stallHeaderDescription}>Items you crafted, ready for sale</span>
        </div>
        <div className={s.groupsContainer}>
          {groups.map((group) => (
            <div key={group.name} className={s.group}>
              <span className={s.groupTitle}>{group.name}</span>
              <div className={s.itemsContainer}>
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className={`${s.item} ${highlightedLootItem.id === item.id ? s.active : ""}`}
                    onClick={() => setHighlightedLootItem(item)}
                  >
                    <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className={s.button} onClick={onSellAndClose}>
          {`Sell everything (${totalProfit} gold) & call it a day`}
        </button>
      </div>
      <div className={s.lootDetailsContainer}>
        {highlightedLootItem && (
          <>
            <div className={s.imageContainer}>
              <img className={s.image} src={highlightedLootItem.imageUrl} />
              <span className={s.price}>{highlightedLootItem.price}</span>
            </div>
            <LootDescription name={highlightedLootItem.name} category={highlightedLootItem.category} details={highlightedLootItem.lootDetails} />
          </>
        )}
      </div>
    </div>
  );
};
