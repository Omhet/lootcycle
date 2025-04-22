import s from "./LootDescription.module.css";

type LootDetail = {
    lootDetailName: string;
    junkImageUrl: string;
};

type LootDescriptionProps = {
    name: string;
    category: string;
    details: LootDetail[];
};

export const LootDescription = ({
    name,
    category,
    details,
}: LootDescriptionProps) => {
    return (
        <div className={s.textContainer}>
            <div className={s.titleContainer}>
                <span className={s.name}>{name}</span>
                <span className={s.category}>{category}</span>
            </div>
            <div className={s.detailsContainer}>
                {details.map((item) => (
                    <div key={item.lootDetailName} className={s.detailItem}>
                        <span className={s.detailName}>
                            {item.lootDetailName}
                        </span>
                        <div className={s.junkImageContainer}>
                            <img
                                className={s.junkImage}
                                src={item.junkImageUrl}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
