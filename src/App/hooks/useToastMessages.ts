import { useEffect } from "react";
import { toast, ToastOptions } from "react-toastify";
import { EventBus } from "../../game/EventBus";
import { CraftingFailureReason } from "../../lib/craft/craftModel";

/**
 * Default toast configuration
 */
const DEFAULT_TOAST_CONFIG: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Hook for handling all toast notifications in the application
 * Subscribes to relevant events and shows appropriate toast messages
 */
export const useToastMessages = () => {
  useEffect(() => {
    // Handle crafting failures
    const handleCraftingFailure = (failure: { reason: CraftingFailureReason; message?: string }) => {
      const toastMessage = failure.message || "Crafting failed";
      toast.error(toastMessage, DEFAULT_TOAST_CONFIG);
    };

    // Handle success messages
    const handleSuccess = (message: string) => {
      toast.success(message, DEFAULT_TOAST_CONFIG);
    };

    // Handle info messages
    const handleInfo = (message: string) => {
      toast.info(message, DEFAULT_TOAST_CONFIG);
    };

    // Handle warning messages
    const handleWarning = (message: string) => {
      toast.warning(message, DEFAULT_TOAST_CONFIG);
    };

    // Subscribe to events
    EventBus.on("crafting-failure", handleCraftingFailure);
    EventBus.on("toast-success", handleSuccess);
    EventBus.on("toast-info", handleInfo);
    EventBus.on("toast-warning", handleWarning);

    // Cleanup on unmount
    return () => {
      EventBus.off("crafting-failure", handleCraftingFailure);
      EventBus.off("toast-success", handleSuccess);
      EventBus.off("toast-info", handleInfo);
      EventBus.off("toast-warning", handleWarning);
    };
  }, []);
};
