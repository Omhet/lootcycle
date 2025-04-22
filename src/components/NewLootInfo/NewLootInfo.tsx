import { LootDescription } from "../LootDescription/LootDescription";
import s from "./NewLootInfo.module.css";

type LootDetail = {
    lootDetailName: string;
    junkImageUrl: string;
};

type NewLootInfoProps = {
    name: string;
    category: string;
    details: LootDetail[];
    onClose: () => void;
};

export const NewLootInfo = ({
    name,
    category,
    details,
    onClose,
}: NewLootInfoProps) => {
    return (
        <div className={s.newLootInfo}>
            <LootDescription
                name={name}
                category={category}
                details={details}
            />
            <button className={s.button} onClick={onClose}>
                Awesome
            </button>
        </div>
    );
};
