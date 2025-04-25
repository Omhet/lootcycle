import s from "./LootDescription.module.css";

type LootDetail = {
  lootDetailName: string;
  junkImageUrl?: string;
  junkPieceName?: string;
};

type LootDescriptionProps = {
  name: string;
  category: string;
  details: LootDetail[];
  price: number;
  imageUrl: string;
};

export const LootDescription = ({ name, category, details, price, imageUrl }: LootDescriptionProps) => {
  return (
    <>
      <div className={s.headerContainer}>
        <div className={s.imageContainer}>
          <img className={s.image} src={imageUrl} />
          <div className={s.price}>
            <span className={s.moneyBalanceValue}>{price}</span>
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />
          </div>
        </div>
        <div className={s.titleContainer}>
          <span className={s.name}>{name}</span>
          <span className={s.category}>{category}</span>
        </div>
      </div>
      <div className={s.detailsContainer}>
        {details.map((item) => (
          <div key={item.lootDetailName} className={s.detailItem}>
            <span className={s.detailName}>
              {item.lootDetailName}
              {item.junkPieceName && <span className={s.junkPieceName}> was crafted from {item.junkPieceName}</span>}
            </span>
            {item.junkImageUrl && (
              <div className={s.junkImageContainer}>
                <img className={s.junkImage} src={item.junkImageUrl} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
