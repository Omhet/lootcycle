import { useMemo } from "react";
import "./CurrentRecipe.css";

interface CurrentRecipeProps {
  recipeId: string | null;
}

export const CurrentRecipe = ({ recipeId }: CurrentRecipeProps) => {
  const recipeName = useMemo(() => {
    if (!recipeId) return "";
    return recipeId.charAt(0).toUpperCase() + recipeId.slice(1).replace("_", " ");
  }, [recipeId]);

  if (!recipeId) {
    return null;
  }

  return (
    <div className="current-recipe-container">
      <div className="current-recipe-card">
        <img src={`/assets/recipes/${recipeId}.png`} alt={`${recipeName} Recipe`} className="current-recipe-image" />
        <div className="current-recipe-label">{recipeName}</div>
      </div>
    </div>
  );
};
