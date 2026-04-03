"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";

import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { createIpo, createIpoPosition, getAccounts } from "@/services/api";
import { extractErrorMessage } from "@/services/errors";
import type { Account } from "@/types/account";

type FeedbackModalState = {
  open: boolean;
  variant: AppModalVariant;
  tone: AppModalTone;
  title: string;
  description: string;
  confirmText: string;
  onConfirm?: () => void;
};

const emptyModalState = (): FeedbackModalState => ({
  open: false,
  variant: "info",
  tone: "primary",
  title: "",
  description: "",
  confirmText: "Tamam",
});

type PositionDraft = {
  accountId: string;
  requestedLotCount: string;
  buyPrice: string;
  notes: string;
};

const emptyPositionDraft = (): PositionDraft => ({
  accountId: "",
  requestedLotCount: "",
  buyPrice: "",
  notes: "",
});

export default function YeniArzEkle() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [code, setCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [offeringPrice, setOfferingPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [positions, setPositions] = useState<PositionDraft[]>([emptyPositionDraft()]);
  const [saving, setSaving] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());

  const closeModal = () => setModalState(emptyModalState());

  const openModal = (config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadAccounts = async () => {
      try {
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
        setLoadingAccounts(false);
      }
    };

    void loadAccounts();
  }, [router]);

  const updatePosition = (index: number, field: keyof PositionDraft, value: string) => {
    setPositions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const addPositionRow = () => {
    setPositions((current) => [...current, emptyPositionDraft()]);
  };

  const removePositionRow = (index: number) => {
    setPositions((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const createdIpo = await createIpo({
        code,
        companyName,
        offeringPrice: Number(offeringPrice),
        currentPrice: currentPrice ? Number(currentPrice) : Number(offeringPrice),
        currency,
      });

      const validPositions = positions.filter((position) => position.accountId && position.requestedLotCount);
      for (const position of validPositions) {
        await createIpoPosition(createdIpo.id, {
          accountId: Number(position.accountId),
          requestedLotCount: Number(position.requestedLotCount),
          buyPrice: position.buyPrice ? Number(position.buyPrice) : Number(offeringPrice),
          notes: position.notes || undefined,
        });
      }

      openModal({
        variant: "success",
        tone: "success",
        title: "Arz Oluşturuldu",
        description: "Yeni halka arz ve hesap satırları kaydedildi.",
        confirmText: "Detaya Git",
        onConfirm: () => {
          closeModal();
          router.push(`/halkaArzListesi/${createdIpo.id}`);
        },
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Arz kaydedilemedi");
      openModal({
        variant: "error",
        tone: "danger",
        title: "Arz Kaydedilemedi",
        description: extractErrorMessage(saveError, "Arz kaydedilemedi"),
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
                  <h1 className="text-2xl font-bold text-white">Yeni Arz Ekle</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form className="grid gap-8 lg:grid-cols-[1fr_1.1fr]" onSubmit={handleSubmit}>
            <section className="rounded-3xl border border-white/15 bg-[#0d2336]/85 p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/45">Arz Bilgisi</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Yeni Halka Arz Ekle</h2>

              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Arz Kodu</span>
                  <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60" placeholder="AAGYO" required />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Şirket Adı</span>
                  <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60" placeholder="Sirket adi" />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/75">Arz Fiyatı</span>
                    <input value={offeringPrice} onChange={(event) => setOfferingPrice(event.target.value)} type="number" step="0.01" min="0" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60" required />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/75">Güncel Fiyat</span>
                    <input value={currentPrice} onChange={(event) => setCurrentPrice(event.target.value)} type="number" step="0.01" min="0" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60" placeholder="Arz fiyatı için boş bırak" />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/75">Para Birimi</span>
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60">
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/45">Hesap Dağılımı</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">Hesap Ekle</h2>
                </div>
                <button type="button" onClick={addPositionRow} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-200">
                  <IconPlus className="h-4 w-4" />
                  Satır
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {loadingAccounts ? <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-white/70">Hesaplar Yükleniyor...</div> : null}
                {!loadingAccounts && accounts.length === 0 ? (
                  <div className="rounded-2xl border border-amber-300/30 bg-amber-950/20 p-4 text-sm text-amber-100">
                    Arz oluşturmadan önce en az bir hesap eklemelisin. Hesaplarım sayfasından hesap ekleyebilirsin.
                  </div>
                ) : null}

                {positions.map((position, index) => (
                  <div key={`${index}-${position.accountId}`} className="rounded-2xl border border-white/15 bg-[#071a29]/80 p-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-white/70">Hesap</span>
                        <select value={position.accountId} onChange={(event) => updatePosition(index, "accountId", event.target.value)} className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none">
                          <option value="">Seç</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>{account.accountName}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/70">Talep Edilen Lot</span>
                        <input value={position.requestedLotCount} onChange={(event) => updatePosition(index, "requestedLotCount", event.target.value)} type="number" min="1" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none" />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/70">Lot Fiyatı</span>
                        <input value={position.buyPrice} onChange={(event) => updatePosition(index, "buyPrice", event.target.value)} type="number" min="0" step="0.01" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none" placeholder="Otomatik" />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/70">Not</span>
                        <input value={position.notes} onChange={(event) => updatePosition(index, "notes", event.target.value)} className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none" placeholder="Opsiyonel" />
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button type="button" onClick={() => removePositionRow(index)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/30 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10">
                        <IconTrash className="h-4 w-4" />
                        Satırı Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="submit" disabled={saving || accounts.length === 0} className="rounded-2xl bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Kaydediliyor..." : "Arzı Kaydet"}
                </button>
                <button type="button" onClick={() => router.push("/hesaplarim")} className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                  Hesaplarıma Git
                </button>
              </div>
              <div className="mt-8 text-red-200 text-sm">
                * İlk girilen lot talep edilen lot olarak kaydedilir. Satın alınan lot detay ekranında sonradan güncellenir.
              </div>
            </section>
          </form>
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
        onConfirm={modalState.onConfirm}
        onClose={closeModal}
      />
    </div>
  );
}
