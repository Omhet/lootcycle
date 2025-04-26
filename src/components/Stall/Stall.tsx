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
  junkImageUrl?: string;
  junkPieceName?: string; // Name of the junk piece that was used to craft this detail
};

type StallProps = {
  groups: StallGroup[];
  moneyBalance: number;
  onSellAndClose: () => void;
  onClose: () => void;
};

export const Stall = ({ groups, moneyBalance, onSellAndClose, onClose }: StallProps) => {
  const hasItems = groups.length > 0 && groups.some((group) => group.items.length > 0);

  // Only set highlighted item if we have items
  const [highlightedLootItem, setHighlightedLootItem] = useState<StallLootItem | null>(hasItems ? groups[0].items[0] : null);

  const totalProfit = groups.reduce((total, group) => total + group.items.reduce((groupTotal, item) => groupTotal + item.price, 0), 0);

  return (
    <div className={s.background}>
      <div className={s.stallContainer}>
        <div className={s.stallHeader}>
          <div className={s.stallHeaderTitleContainer}>
            <span className={s.stallHeaderTitle}>Stall</span>
            <span className={s.stallHeaderDescription}>Items you crafted, ready for sale</span>
          </div>
          <div className={s.moneyBalance}>
            <span className={s.moneyBalanceValue}>{moneyBalance}</span>
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />
          </div>
        </div>
        <div className={s.stall}>
          {hasItems ? (
            <div className={s.stallContent}>
              <div className={s.groupsContainer}>
                {groups.map((group) => (
                  <div key={group.name} className={s.group}>
                    <span className={s.groupTitle}>{group.name}</span>
                    <div className={s.itemsContainer}>
                      {group.items.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className={`${s.item} ${highlightedLootItem?.id === item.id ? s.active : ""}`}
                          onClick={() => setHighlightedLootItem(item)}
                        >
                          <img src={item.imageUrl} alt={item.name} className={s.itemImage} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={s.emptyStateContainer}>
              <p className={s.emptyStateMessage}>You have no items to sell</p>
              <p className={s.emptyStateSubMessage}>Craft some items first to display them here</p>
            </div>
          )}
          <div className={s.lootDetailsContainer}>
            {highlightedLootItem ? (
              <LootDescription
                name={highlightedLootItem.name}
                category={highlightedLootItem.category}
                details={highlightedLootItem.lootDetails}
                price={highlightedLootItem.price}
                imageUrl={highlightedLootItem.imageUrl}
              />
            ) : (
              <div className={s.emptyDetailsMessage}>Select an item to see details</div>
            )}
          </div>
        </div>
        <div className={s.buttonsContainer}>
          <button className={`${s.button} ${s.sellButton}`} onClick={onSellAndClose}>
            {hasItems ? (
              <span className={s.sellButtonText}>
                Sell everything ({totalProfit}
                <img className={s.coinImage} src="/assets/junk/golden_coin.png" />) & call it a day
              </span>
            ) : (
              "Call it a day"
            )}
          </button>
          <button className={`${s.button} ${s.closeButton}`} onClick={onClose}>
            Back to crafting
          </button>
        </div>
      </div>
    </div>
  );
};
