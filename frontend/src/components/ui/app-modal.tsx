"use client";

import type { ReactNode } from "react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
  IconX,
  IconXboxX,
} from "@tabler/icons-react";

export type AppModalVariant = "success" | "error" | "warning" | "info" | "confirm";
export type AppModalTone = "primary" | "success" | "danger" | "warning" | "neutral";

type AppModalProps = {
  open: boolean;
  variant?: AppModalVariant;
  tone?: AppModalTone;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  loading?: boolean;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
};

const variantStyles: Record<AppModalVariant, { panel: string; iconWrap: string; icon: typeof IconInfoCircle }> = {
  success: {
    panel: "border-emerald-300/25 bg-emerald-950/85",
    iconWrap: "bg-emerald-300/15 text-emerald-200",
    icon: IconCircleCheck,
  },
  error: {
    panel: "border-rose-300/25 bg-rose-950/85",
    iconWrap: "bg-rose-300/15 text-rose-200",
    icon: IconXboxX,
  },
  warning: {
    panel: "border-amber-300/25 bg-amber-950/85",
    iconWrap: "bg-amber-300/15 text-amber-200",
    icon: IconAlertTriangle,
  },
  info: {
    panel: "border-cyan-300/25 bg-sky-950/85",
    iconWrap: "bg-cyan-300/15 text-cyan-100",
    icon: IconInfoCircle,
  },
  confirm: {
    panel: "border-white/20 bg-slate-950/92",
    iconWrap: "bg-white/10 text-white",
    icon: IconAlertTriangle,
  },
};

const toneStyles: Record<AppModalTone, string> = {
  primary: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
  success: "bg-emerald-300 text-slate-950 hover:bg-emerald-200",
  danger: "bg-rose-300 text-slate-950 hover:bg-rose-200",
  warning: "bg-amber-300 text-slate-950 hover:bg-amber-200",
  neutral: "bg-white/10 text-white hover:bg-white/20",
};

export function AppModal({
  open,
  variant = "info",
  tone = "primary",
  title,
  description,
  confirmText = "Tamam",
  cancelText = "Vazgec",
  onConfirm,
  onClose,
  loading = false,
  showCancel,
  closeOnBackdrop = true,
}: AppModalProps) {
  if (!open) {
    return null;
  }

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;
  const shouldShowCancel = showCancel ?? variant === "confirm";

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Modali kapat"
        onClick={closeOnBackdrop && !loading ? onClose : undefined}
        className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm"
      />

      <div className={`relative w-full max-w-md rounded-[28px] border p-6 shadow-2xl shadow-black/35 ${currentVariant.panel}`}>
        <button
          type="button"
          onClick={loading ? undefined : onClose}
          className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-white/5 p-2 text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading}
        >
          <IconX className="h-4 w-4" />
        </button>

        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${currentVariant.iconWrap}`}>
          <Icon className="h-7 w-7" />
        </div>

        <h2 className="mt-5 pr-10 text-2xl font-bold text-white">{title}</h2>
        <div className="mt-3 text-sm leading-6 text-white/72">{description}</div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {shouldShowCancel ? (
            <button
              type="button"
              onClick={loading ? undefined : onClose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {cancelText}
            </button>
          ) : null}

          <button
            type="button"
            onClick={loading ? undefined : onConfirm ?? onClose}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${toneStyles[tone]}`}
          >
            {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}