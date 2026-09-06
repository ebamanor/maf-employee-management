export type ToastType = "success" | "error" | "info";

export interface ToastDetail {
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>("app-toast", {
      detail: { message, type },
    })
  );
}
