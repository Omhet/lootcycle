import s from "./NewLootInfo.module.css";

type NewLootInfoProps = {
  name: string;
  onClose: () => void;
};

export const NewLootInfo = ({ name, onClose }: NewLootInfoProps) => {
  return (
    <div className={s.newLootInfo}>
      <div className={s.name}>{name}</div>
      <button className={s.button} onClick={onClose}>
        Awesome
      </button>
    </div>
  );
};
