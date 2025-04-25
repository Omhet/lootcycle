import { CurrentRecipe } from "../../components/CurrentRecipe/CurrentRecipe";
import { useCraftStore } from "../../store/useCraftStore";
import { GameState, useGameFlowStore } from "../../store/useGameFlowStore";

/**
 * Container component for CurrentRecipe
 * Connects to the craft store and game flow store to determine when to show the recipe
 */
export const CurrentRecipeContainer = () => {
  const { currentRecipeId } = useCraftStore();
  const { currentState } = useGameFlowStore();

  // Only show the recipe when the game is in progress
  if (currentState !== GameState.DayInProgress) {
    return null;
  }

  return <CurrentRecipe recipeId={currentRecipeId} />;
};
