/* Library imports */
import { toaster } from "@/components/ui/toaster";

/* Toast content, with the type decided by the helper that is called */
interface ToastConfig {
  title: string;
  description?: string;
  duration?: number;
}

type ToastType = "success" | "error" | "warning" | "info";

const createToast = (type: ToastType, config: ToastConfig) => {
  toaster.create({
    closable: true,
    duration: 3000,
    ...config,
    type,
  });
};

export const showSuccessToast = (config: ToastConfig) => createToast("success", config);

/* Errors stay until dismissed so they can be read, unless the caller sets a duration */
export const showErrorToast = (config: ToastConfig) =>
  createToast("error", { duration: Infinity, ...config });

export const showWarningToast = (config: ToastConfig) => createToast("warning", config);

export const showInfoToast = (config: ToastConfig) => createToast("info", config);
