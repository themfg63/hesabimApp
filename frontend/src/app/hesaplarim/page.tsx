"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconBuildingBank, IconPlus } from "@tabler/icons-react";

import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { createAccount, getAccounts } from "@/services/api";
import { extractErrorMessage } from "@/services/errors";
import type { Account } from "@/types/account";

type FeedbackModalState = {
  open: boolean;
  variant: AppModalVariant;
  tone: AppModalTone;
  title: string;
  description: string;
  confirmText: string;
};

const emptyModalState = (): FeedbackModalState => ({
  open: false,
  variant: "info",
  tone: "primary",
  title: "",
  description: "",
  confirmText: "Tamam",
});

export default function Hesaplarim() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());

  const closeModal = useCallback(() => setModalState(emptyModalState()), []);

  const openModal = useCallback((config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAccounts();
      setAccounts(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Hesaplar yuklenemedi");
      openModal({
        variant: "error",
        tone: "danger",
        title: "Hesaplar Yüklenemedi",
        description: extractErrorMessage(loadError, "Hesaplar yuklenemedi"),
        confirmText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  }, [openModal]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    void loadAccounts();
  }, [loadAccounts, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await createAccount({
        accountName,
        accountType,
        currency,
      });
      setAccountName("");
      setAccountType("");
      setCurrency("TRY");
      await loadAccounts();
      openModal({
        variant: "success",
        tone: "success",
        title: "Hesap Eklendi",
        description: "Yeni banka hesabı başarıyla kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Hesap kaydedilemedi");
      openModal({
        variant: "error",
        tone: "danger",
        title: "Hesap Eklenemedi",
        description: extractErrorMessage(saveError, "Hesap kaydedilemedi"),
        confirmText: "Tamam",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-ivosis-900 via-ivosis-800 to-natural-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivosis-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivosis-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/exchange")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20"
                >
                  <IconArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-ivosis-500 to-ivosis-600 rounded-lg flex items-center justify-center">
                    <IconBuildingBank className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Banka Hesaplarım</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="mt-2 text-3xl font-bold text-white">Hesaplar</h2>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                  {accounts.length} Hesap
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-white/70">Hesaplar Yükleniyor...</div>
              ) : accounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-6 text-white/70">
                  Henüz hesap Eklemedin. Formdan ilk banka hesabını oluştur.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {accounts.map((account) => (
                    <div key={account.id} className="rounded-2xl border border-white/15 bg-slate-950/25 p-5 shadow-lg shadow-black/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{account.accountName}</h3>
                          <p className="mt-1 text-sm text-white/55">{account.accountType || "Banka hesabi"}</p>
                        </div>
                        <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-900">
                          {account.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/15 bg-[#09253a]/80 p-6 backdrop-blur-xl">
              <h2 className="mt-2 text-3xl font-bold text-white">Yeni Hesap</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Bu hesaplar yeni arz eklerken lot dağıtım satırlarında seçilecek.
              </p>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Banka Adı</span>
                  <input
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                    placeholder="Örnek: Garanti"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Hesap Sahibi</span>
                  <input
                    value={accountType}
                    onChange={(event) => setAccountType(event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                    placeholder=""
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Para Birimi</span>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconPlus className="h-5 w-5" />
                  {saving ? "Kaydediliyor..." : "Hesap Ekle"}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <AppModal
        open={modalState.open}
        variant={modalState.variant}
        tone={modalState.tone}
        title={modalState.title}
        description={modalState.description}
        confirmText={modalState.confirmText}
        onClose={closeModal}
      />
    </div>
  );
}
