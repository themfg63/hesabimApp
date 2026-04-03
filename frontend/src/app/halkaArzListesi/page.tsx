"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconChartCandle, IconChevronRight, IconPlus, IconTrash } from "@tabler/icons-react";

import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { deleteIpo, getIpos } from "@/services/api";
import { extractErrorMessage } from "@/services/errors";
import type { IpoSummaryItem } from "@/types/ipo";

type FeedbackModalState = {
  open: boolean;
  variant: AppModalVariant;
  tone: AppModalTone;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
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

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function HalkaArzListesi() {
  const router = useRouter();
  const [ipos, setIpos] = useState<IpoSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());
  const totalCost = ipos.reduce((sum, ipo) => sum + ipo.totalCost, 0);
  const totalProfit = ipos.reduce((sum, ipo) => sum + ipo.totalProfitLoss, 0);
  const totalPendingCash = ipos.reduce((sum, ipo) => sum + ipo.totalPendingCash, 0);
  const soldCount = ipos.filter((ipo) => ipo.fullySold).length;
  const activeCount = ipos.length - soldCount;

  const closeModal = () => setModalState(emptyModalState());

  const openModal = (config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  };

  const handleDeleteIpo = async (ipoId: number, name: string) => {
    try {
      setModalState((current) => ({ ...current, loading: true }));
      await deleteIpo(ipoId);
      setIpos((current) => current.filter((ipo) => ipo.id !== ipoId));
      openModal({
        variant: "success",
        tone: "success",
        title: "Halka Arz Silindi",
        description: `${name} portföyden kaldırıldı.`,
        confirmText: "Tamam",
      });
    } catch (deleteError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Halka Arz Silinemedi",
        description: extractErrorMessage(deleteError, "Halka arz silinirken bir hata oluştu"),
        confirmText: "Tamam",
      });
    }
  };

  const requestDelete = (event: React.MouseEvent<HTMLButtonElement>, ipo: IpoSummaryItem) => {
    event.preventDefault();
    event.stopPropagation();

    openModal({
      variant: "confirm",
      tone: "danger",
      title: "Halka arz silinsin mi?",
      description: `${ipo.companyName || ipo.code} kaydını ve bağlı hesap satırlarını silmek üzeresin. Bu işlem geri alınamaz.`,
      confirmText: "Sil",
      cancelText: "Vazgeç",
      showCancel: true,
      loading: false,
      onConfirm: () => void handleDeleteIpo(ipo.id, ipo.companyName || ipo.code),
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadIpos = async () => {
      try {
        setLoading(true);
        const response = await getIpos();
        setIpos(response);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Arz listesi yuklenemedi");
      } finally {
        setLoading(false);
      }
    };

    void loadIpos();
  }, [router]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-ivosis-950 via-ivosis-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl sm:-right-12 sm:h-96 sm:w-96"></div>
        <div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl sm:-bottom-12 sm:-left-12 sm:h-96 sm:w-96"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

      <div className="relative z-10 min-h-screen">
        <header className="border-b border-white/10 bg-slate-950/35 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
                <button
                  onClick={() => router.push("/exchange")}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-white transition hover:bg-white/14"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/60">Halka Arz Takibi</p>
                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Portföyüm</h1>
                  <p className="mt-1 max-w-2xl text-sm text-white/55 sm:text-base">
                    Talep, dağıtım ve satış durumlarını tek ekranda daha okunabilir şekilde takip et.
                  </p>
                </div>

                <Link
                  href="/yeniArzEkle"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 sm:self-start"
                >
                  <IconPlus className="h-5 w-5" />
                  Yeni Arz
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-fit">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Aktif</p>
                  <p className="mt-1 text-lg font-semibold text-white">{activeCount}</p>
                </div>
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/8 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/55">Satılan</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-100">{soldCount}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="overflow-hidden rounded-4xl border border-white/12 bg-white/8 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-linear-to-r from-white/8 to-white/3 px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 sm:h-16 sm:w-16">
                    <IconChartCandle className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Portföyüm</h2>
                  </div>
                </div>

                <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-4 sm:px-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Nakitte Kalan</p>
                  <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{formatCurrency(totalPendingCash, "TRY")}</p>
                </div>
              </div>
            </div>

            {!loading && !error ? (
              <div className="grid gap-4 border-b border-white/10 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">Arz Sayısı</p>
                  <p className="mt-3 text-3xl font-bold text-white">{ipos.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">Toplam Maliyet</p>
                  <p className="mt-3 text-xl font-bold text-white sm:text-2xl">{formatCurrency(totalCost, "TRY")}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">Toplam Kar</p>
                  <p className={`mt-3 text-xl font-bold sm:text-2xl ${totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{formatCurrency(totalProfit, "TRY")}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">Tamamlanan Arz</p>
                  <p className="mt-3 text-3xl font-bold text-white">{soldCount}</p>
                </div>
              </div>
            ) : null}

            <div className="px-5 py-5 sm:px-8 sm:py-8">
              {loading ? (
                <div className="rounded-3xl border border-white/10 bg-black/10 p-6 text-white/70">Arz listesi yukleniyor...</div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-rose-200">{error}</div>
              ) : ipos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-black/10 p-8 text-center text-white/70">
                  Henüz halka arz eklemedin. İlk kaydı oluşturup hesap bazlı lot dağılımını takibe başlayabilirsin.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                  {ipos.map((ipo) => {
                    const isPositive = ipo.totalProfitLoss >= 0;
                    const isFullySold = ipo.fullySold;

                    return (
                      <Link
                        key={ipo.id}
                        href={`/halkaArzListesi/${ipo.id}`}
                        className={`group flex min-h-100 flex-col rounded-[1.75rem] border p-4 shadow-2xl shadow-black/10 transition duration-300 sm:min-h-104 sm:p-5 lg:hover:-translate-y-1 ${isFullySold ? "border-emerald-300/25 bg-linear-to-br from-emerald-950/90 via-slate-950/95 to-slate-900/90 hover:border-emerald-300/45" : "border-white/15 bg-linear-to-br from-[#0f2a42]/92 via-[#0a2034]/96 to-[#091826]/94 hover:border-cyan-300/30"}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className={`text-sm uppercase tracking-[0.35em] ${isFullySold ? "text-emerald-200/70" : "text-cyan-200/55"}`}>{ipo.code}</p>
                            <h3 className="mt-2 line-clamp-2 min-h-14 text-xl font-bold text-white sm:min-h-16 sm:text-2xl">{ipo.companyName || ipo.code}</h3>
                          </div>
                          <div className="flex items-start gap-2 self-start sm:flex-col sm:items-end">
                            <button
                              type="button"
                              onClick={(event) => requestDelete(event, ipo)}
                              aria-label={`${ipo.companyName || ipo.code} halka arzını sil`}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/18 hover:text-white"
                            >
                              <IconTrash className="h-5 w-5" />
                            </button>
                            <span className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-sm font-semibold sm:text-base ${isPositive ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
                              {formatCurrency(ipo.totalProfitLoss, ipo.currency)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex min-h-9 flex-wrap items-center gap-2">
                          {isFullySold ? (
                            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                              Tamamı Satıldı
                            </span>
                          ) : (
                            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                              Aktif Arz
                            </span>
                          )}
                        </div>

                        <div className="mt-5 grid flex-1 grid-cols-1 gap-3 text-sm text-white/72 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Talep / Alinan</p>
                            <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{ipo.totalRequestedLot} / {ipo.totalPurchasedLot}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Hesap Sayısı</p>
                            <p className="mt-1 text-lg font-semibold text-white sm:text-xl">{ipo.positionCount}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Toplam Maliyet</p>
                            <p className="mt-1 font-semibold text-white">{formatCurrency(ipo.totalCost, ipo.currency)}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Guncel Deger</p>
                            <p className="mt-1 font-semibold text-white">{formatCurrency(ipo.totalCurrentValue, ipo.currency)}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4 sm:col-span-2">
                            <p className="text-white/65">Nakitte Kalan</p>
                            <p className="mt-1 font-semibold text-white">{formatCurrency(ipo.totalPendingCash, ipo.currency)}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/55">
                          <span className="font-medium text-white/65">Detaya git</span>
                          <IconChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
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
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        loading={modalState.loading}
        onConfirm={modalState.onConfirm}
        onClose={closeModal}
      />
    </div>
  );
}
