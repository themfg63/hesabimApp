"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconChartBar,
  IconCoin,
  IconCurrencyLira,
  IconDeviceFloppy,
  IconDiscountCheck,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconShoppingCart,
  IconTrash,
  IconWallet,
  IconX,
} from "@tabler/icons-react";

import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { createIpoPosition, deleteIpoPosition, getAccounts, getIpoDetail, sellIpoPosition, updateIpoPosition, updateIpoPrice } from "@/services/api";
import { extractErrorMessage } from "@/services/errors";
import type { Account } from "@/types/account";
import type { CreateIpoPositionPayload, IpoPortfolioResponse, IpoPositionRow, UpdateIpoPositionPayload } from "@/types/ipo";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

type CreatePositionDraft = {
  accountId: string;
  requestedLotCount: string;
  buyPrice: string;
  notes: string;
};

type EditPositionDraft = {
  accountId: string;
  requestedLotCount: string;
  purchasedLotCount: string;
  buyPrice: string;
  notes: string;
};

type FeedbackModalState = {
  open: boolean;
  variant: AppModalVariant;
  tone: AppModalTone;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
};

const emptyCreateDraft = (): CreatePositionDraft => ({
  accountId: "",
  requestedLotCount: "",
  buyPrice: "",
  notes: "",
});

const emptyEditDraft = (): EditPositionDraft => ({
  accountId: "",
  requestedLotCount: "",
  purchasedLotCount: "",
  buyPrice: "",
  notes: "",
});

const emptyModalState = (): FeedbackModalState => ({
  open: false,
  variant: "info",
  tone: "primary",
  title: "",
  description: "",
  confirmText: "Tamam",
});

export default function IpoDetailPage() {
  const router = useRouter();
  const params = useParams<{ ipoId: string }>();
  const ipoId = params.ipoId;

  const [portfolio, setPortfolio] = useState<IpoPortfolioResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [sellingPositionId, setSellingPositionId] = useState<number | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [salePriceInput, setSalePriceInput] = useState("");
  const [savingSale, setSavingSale] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreatePositionDraft>(emptyCreateDraft());
  const [editDraft, setEditDraft] = useState<EditPositionDraft>(emptyEditDraft());
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());

  const closeModal = () => setModalState(emptyModalState());

  const openModal = (config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      const portfolioResponse = await getIpoDetail(ipoId);
      setPortfolio(portfolioResponse);
      setPriceInput(String(portfolioResponse.ipo.currentPrice));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Detay sayfasi yuklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      setLoading(true);
      setLoadingAccounts(true);

      const [portfolioResult, accountsResult] = await Promise.allSettled([getIpoDetail(ipoId), getAccounts()]);

      if (cancelled) {
        return;
      }

      if (portfolioResult.status === "fulfilled") {
        setPortfolio(portfolioResult.value);
        setPriceInput(String(portfolioResult.value.ipo.currentPrice));
      }

      if (accountsResult.status === "fulfilled") {
        setAccounts(accountsResult.value);
      }

      if (portfolioResult.status === "rejected") {
        setError(portfolioResult.reason instanceof Error ? portfolioResult.reason.message : "Detay sayfasi yuklenemedi");
      } else if (accountsResult.status === "rejected") {
        setError(accountsResult.reason instanceof Error ? accountsResult.reason.message : "Hesaplar yuklenemedi");
      } else {
        setError(null);
      }

      setLoading(false);
      setLoadingAccounts(false);
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [ipoId, router]);

  const resetEditState = () => {
    setEditingPositionId(null);
    setEditDraft(emptyEditDraft());
  };

  const handlePriceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSavingPrice(true);
      setError(null);
      await updateIpoPrice(ipoId, Number(priceInput));
      await loadPage();
      openModal({
        variant: "success",
        tone: "success",
        title: "Fiyat Güncellendi",
        description: "Halka arzın güncel fiyatı kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (saveError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Fiyat Güncellenemedi",
        description: extractErrorMessage(saveError, "Fiyat guncellenemedi"),
        confirmText: "Tamam",
      });
    } finally {
      setSavingPrice(false);
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!portfolio) {
      return;
    }

    try {
      setSavingCreate(true);
      setError(null);

      const payload: CreateIpoPositionPayload = {
        accountId: Number(createDraft.accountId),
        requestedLotCount: Number(createDraft.requestedLotCount),
        buyPrice: createDraft.buyPrice ? Number(createDraft.buyPrice) : portfolio.ipo.offeringPrice,
        notes: createDraft.notes || undefined,
      };

      await createIpoPosition(ipoId, payload);
      setCreateDraft(emptyCreateDraft());
      await loadPage();
      openModal({
        variant: "success",
        tone: "success",
        title: "Hesap Satırı Eklendi",
        description: "Hesap bazlı lot satırı başarıyla oluşturuldu.",
        confirmText: "Tamam",
      });
    } catch (saveError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Hesap Satırı Eklenemedi",
        description: extractErrorMessage(saveError, "Hesap satiri eklenemedi"),
        confirmText: "Tamam",
      });
    } finally {
      setSavingCreate(false);
    }
  };

  const handleDelete = async (positionId: number) => {
    try {
      setError(null);
      await deleteIpoPosition(positionId);
      if (editingPositionId === positionId) {
        resetEditState();
      }
      if (sellingPositionId === positionId) {
        setSellingPositionId(null);
        setSalePriceInput("");
      }
      await loadPage();
      openModal({
        variant: "success",
        tone: "success",
        title: "Hesap Satırı Silindi",
        description: "Seçilen hesap satırı kaldırıldı.",
        confirmText: "Tamam",
      });
    } catch (deleteError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Satır Silinemedi",
        description: extractErrorMessage(deleteError, "Pozisyon silinemedi"),
        confirmText: "Tamam",
      });
    }
  };

  const requestDelete = (positionId: number, accountName: string) => {
    openModal({
      variant: "confirm",
      tone: "danger",
      title: "Satırı Sil",
      description: `${accountName} hesabına ait satırı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: "Evet, Sil",
      cancelText: "Vazgec",
      showCancel: true,
      onConfirm: () => {
        closeModal();
        void handleDelete(positionId);
      },
    });
  };

  const openSellPanel = (positionId: number) => {
    resetEditState();
    setSellingPositionId((current) => (current === positionId ? null : positionId));
    setSalePriceInput("");
  };

  const openEditPanel = (row: IpoPositionRow) => {
    setSellingPositionId(null);
    setSalePriceInput("");
    setEditingPositionId((current) => (current === row.positionId ? null : row.positionId));
    setEditDraft({
      accountId: String(row.accountId),
      requestedLotCount: String(row.requestedLotCount),
      purchasedLotCount: row.purchasedLotCount === null ? "" : String(row.purchasedLotCount),
      buyPrice: String(row.buyPrice),
      notes: row.notes ?? "",
    });
  };

  const handleSellSubmit = async (positionId: number) => {
    try {
      setSavingSale(true);
      setError(null);
      await sellIpoPosition(positionId, { salePrice: Number(salePriceInput) });
      setSellingPositionId(null);
      setSalePriceInput("");
      await loadPage();
      openModal({
        variant: "success",
        tone: "success",
        title: "Satış Kaydedildi",
        description: "Satış işlemi başarıyla kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (sellError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Satış Yapılamadı",
        description: extractErrorMessage(sellError, "Satis yapilamadi"),
        confirmText: "Tamam",
      });
    } finally {
      setSavingSale(false);
    }
  };

  const handleUpdateSubmit = async (positionId: number) => {
    try {
      setSavingEdit(true);
      setError(null);

      const payload: UpdateIpoPositionPayload = {
        accountId: Number(editDraft.accountId),
        requestedLotCount: Number(editDraft.requestedLotCount),
        purchasedLotCount: editDraft.purchasedLotCount === "" ? undefined : Number(editDraft.purchasedLotCount),
        buyPrice: Number(editDraft.buyPrice),
        notes: editDraft.notes || undefined,
      };

      await updateIpoPosition(positionId, payload);
      resetEditState();
      await loadPage();
      openModal({
        variant: "success",
        tone: "success",
        title: "Satır Güncellendi",
        description: "Talep ve satın alınan lot bilgileri kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (updateError) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Satır Güncellenemedi",
        description: extractErrorMessage(updateError, "Satir guncellenemedi"),
        confirmText: "Tamam",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const summaryCards = portfolio
    ? [
        {
          label: "Talep Lot",
          value: `${portfolio.summary.totalRequestedLot}`,
          icon: IconCoin,
        },
        {
          label: "Satın Alınan",
          value: `${portfolio.summary.totalPurchasedLot}`,
          icon: IconWallet,
        },
        {
          label: "Nakitte Kalan",
          value: formatCurrency(portfolio.summary.totalPendingCash, portfolio.summary.currency),
          icon: IconCurrencyLira,
        },
        {
          label: "Toplam Kâr",
          value: formatCurrency(portfolio.summary.totalProfitLoss, portfolio.summary.currency),
          icon: IconChartBar,
          positive: portfolio.summary.totalProfitLoss >= 0,
        },
      ]
    : [];

  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-950 via-sky-950 to-emerald-950 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[auto,26px_26px,26px_26px]" />
      </div>

      <div className="relative z-10 min-h-dvh pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/45 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/halkaArzListesi")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <IconArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 sm:text-xs">Arz Detayı</p>
                <h1 className="truncate text-lg font-bold text-white sm:text-2xl">{portfolio?.ipo.code || "Halka Arz"}</h1>
              </div>
            </div>
            {portfolio ? (
              <div className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 sm:block">
                {portfolio.rows.length} Hesap
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {loading ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 p-8 text-white/70 backdrop-blur-xl">Detaylar Yükleniyor...</div>
          ) : portfolio ? (
            <div className="space-y-5 sm:space-y-8">
              {error ? (
                <div className="rounded-3xl border border-rose-300/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100 backdrop-blur-xl">
                  {error}
                </div>
              ) : null}

              <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-xl">
                  <div className="border-b border-white/10 bg-linear-to-r from-cyan-300/14 via-white/6 to-emerald-300/12 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100/80">
                          {portfolio.ipo.code}
                        </div>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          {portfolio.ipo.companyName || portfolio.ipo.code}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
                          Talep edilen lotu, sonradan gerçekleşen satın alınan lotu ve hesapta nakit kalan tutarı aynı ekranda takip et.
                        </p>
                      </div>
                      <div className="self-start rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
                        {portfolio.ipo.currency}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                    {summaryCards.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 shadow-lg shadow-black/10">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                            <div className="rounded-2xl bg-white/10 p-2 text-white/70">
                              <Icon className="h-4 w-4" />
                            </div>
                          </div>
                          <p className={`mt-5 text-xl font-semibold leading-tight sm:text-2xl ${item.positive === undefined ? "text-white" : item.positive ? "text-emerald-300" : "text-rose-300"}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5">
                  <form onSubmit={handleCreateSubmit} className="rounded-[28px] border border-white/15 bg-[#0b2235]/88 p-5 backdrop-blur-xl sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Yeni Satır</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">Hesap Ekle</h2>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/70">Talep lot ile başlar</div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-white/70">Hesap</span>
                        <select
                          value={createDraft.accountId}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, accountId: event.target.value }))}
                          className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                          disabled={loadingAccounts || accounts.length === 0}
                          required
                        >
                          <option value="">Sec</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>{account.accountName}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-white/70">Talep Edilen Lot</span>
                        <input
                          value={createDraft.requestedLotCount}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, requestedLotCount: event.target.value }))}
                          type="number"
                          min="1"
                          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-white/70">Lot Fiyatı</span>
                        <input
                          value={createDraft.buyPrice}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, buyPrice: event.target.value }))}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={String(portfolio.ipo.offeringPrice)}
                          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-white/70">Not</span>
                        <input
                          value={createDraft.notes}
                          onChange={(event) => setCreateDraft((current) => ({ ...current, notes: event.target.value }))}
                          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                          placeholder="Opsiyonel"
                        />
                      </label>
                    </div>

                    <p className="mt-4 text-sm text-white/58">
                      Satın alınan lot bu aşamada boş kalır. Dağıtım netleşince satırdaki düzenle butonundan güncelleyebilirsin.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={savingCreate || loadingAccounts || accounts.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <IconPlus className="h-5 w-5" />
                        {savingCreate ? "Ekleniyor" : "Hesap Satırı Ekle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/hesaplarim")}
                        className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                      >
                        Hesaplarim
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handlePriceSubmit} className="rounded-[28px] border border-white/15 bg-[#0b2235]/88 p-5 backdrop-blur-xl sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Hızlı İşlem</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">Güncel Fiyatı Yenile</h2>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/70">Canlı Kart</div>
                    </div>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
                      <p className="text-sm text-white/58">
                        Bu alan halka arzın genel fiyatını günceller. Satılmış satırlarda kâr hesabı satış fiyatı üzerinden korunur.
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <label className="relative flex-1">
                          <span className="mb-2 block text-sm font-medium text-white/70">Güncel Fiyat</span>
                          <IconCurrencyLira className="pointer-events-none absolute left-4 top-[calc(50%+12px)] h-5 w-5 -translate-y-1/2 text-white/45" />
                          <input
                            value={priceInput}
                            onChange={(event) => setPriceInput(event.target.value)}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-300/60"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={savingPrice}
                          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-auto"
                        >
                          <IconRefresh className="h-5 w-5" />
                          {savingPrice ? "Güncelleniyor" : "Güncelle"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Hesap Bazlı Dağılım</p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Lot Tablosu</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80">{portfolio.rows.length} Hesap</div>
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80">{portfolio.summary.totalRequestedLot} Talep</div>
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80">{portfolio.summary.totalPurchasedLot} Alınan</div>
                  </div>
                </div>

                {portfolio.rows.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/20 p-8 text-center text-white/65">
                    Bu arz için henüz hesap bazlı lot kaydı bulunmuyor.
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-[#081b2a]/75 lg:block">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-[0.24em] text-white/45">
                              <th className="px-5 py-4">Hesap</th>
                              <th className="px-4 py-4">Talep</th>
                              <th className="px-4 py-4">Alınan</th>
                              <th className="px-4 py-4">Lot Fiyatı</th>
                              <th className="px-4 py-4">Hisse Maliyeti</th>
                              <th className="px-4 py-4">Nakitte Kalan</th>
                              <th className="px-4 py-4">Guncel Deger</th>
                              <th className="px-4 py-4">Kar</th>
                              <th className="px-5 py-4 text-center">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolio.rows.map((row) => (
                              <Fragment key={row.positionId}>
                                <tr className={`border-t border-white/6 align-top text-sm ${row.sold ? "bg-emerald-400/5 text-white/70" : "text-white"}`}>
                                  <td className="px-5 py-5">
                                    <div className={`font-semibold ${row.sold ? "text-emerald-200" : "text-white"}`}>{row.accountName}</div>
                                    <div className="mt-1 text-xs text-white/55">{row.accountType || "Hesap tipi belirtilmedi"}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${row.sold ? "bg-emerald-300/15 text-emerald-200" : "bg-cyan-300/15 text-cyan-100"}`}>
                                        {row.positionStatus}
                                      </span>
                                      {row.salePrice !== null ? (
                                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70">
                                          Satış: {formatCurrency(row.salePrice, row.currency)}
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>
                                  <td className="px-4 py-5">{row.requestedLotCount}</td>
                                  <td className="px-4 py-5">{row.purchasedLotCount ?? "-"}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.buyPrice, row.currency)}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.totalCost, row.currency)}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.pendingCash, row.currency)}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.currentValue, row.currency)}</td>
                                  <td className={`px-4 py-5 font-semibold ${row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                                    {formatCurrency(row.profitLoss, row.currency)}
                                  </td>
                                  <td className="px-5 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                      {!row.sold ? (
                                        <button
                                          type="button"
                                          onClick={() => openEditPanel(row)}
                                          className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
                                        >
                                          <IconEdit className="h-4 w-4" />
                                          Düzenle
                                        </button>
                                      ) : (
                                        <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-semibold text-emerald-200">
                                          <IconDiscountCheck className="h-4 w-4" />
                                          Satildi
                                        </span>
                                      )}
                                      {!row.sold ? (
                                        <button
                                          type="button"
                                          onClick={() => openSellPanel(row.positionId)}
                                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
                                        >
                                          <IconShoppingCart className="h-4 w-4" />
                                          Satis Yap
                                        </button>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() => requestDelete(row.positionId, row.accountName)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
                                      >
                                        <IconTrash className="h-4 w-4" />
                                        Sil
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {editingPositionId === row.positionId && !row.sold ? (
                                  <tr className="border-t border-white/6 bg-cyan-300/6 text-white">
                                    <td colSpan={9} className="px-5 py-4">
                                      <div className="grid gap-4 rounded-2xl border border-cyan-300/20 bg-slate-950/30 p-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
                                        <label className="block">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Hesap</span>
                                          <select
                                            value={editDraft.accountId}
                                            onChange={(event) => setEditDraft((current) => ({ ...current, accountId: event.target.value }))}
                                            className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                                          >
                                            {accounts.map((account) => (
                                              <option key={account.id} value={account.id}>{account.accountName}</option>
                                            ))}
                                          </select>
                                        </label>
                                        <label className="block">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Talep Edilen Lot</span>
                                          <input
                                            value={editDraft.requestedLotCount}
                                            onChange={(event) => setEditDraft((current) => ({ ...current, requestedLotCount: event.target.value }))}
                                            type="number"
                                            min="1"
                                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                                          />
                                        </label>
                                        <label className="block">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Satın Alınan Lot</span>
                                          <input
                                            value={editDraft.purchasedLotCount}
                                            onChange={(event) => setEditDraft((current) => ({ ...current, purchasedLotCount: event.target.value }))}
                                            type="number"
                                            min="0"
                                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                                            placeholder="Bos birak"
                                          />
                                        </label>
                                        <label className="block">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Lot Fiyatı</span>
                                          <input
                                            value={editDraft.buyPrice}
                                            onChange={(event) => setEditDraft((current) => ({ ...current, buyPrice: event.target.value }))}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                                          />
                                        </label>
                                        <label className="block xl:col-span-4">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Not</span>
                                          <input
                                            value={editDraft.notes}
                                            onChange={(event) => setEditDraft((current) => ({ ...current, notes: event.target.value }))}
                                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                                            placeholder="Opsiyonel"
                                          />
                                        </label>
                                        <div className="xl:col-span-4 flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => void handleUpdateSubmit(row.positionId)}
                                            disabled={savingEdit || !editDraft.accountId || !editDraft.requestedLotCount || !editDraft.buyPrice}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            <IconDeviceFloppy className="h-4 w-4" />
                                            {savingEdit ? "Kaydediliyor" : "Güncelle"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={resetEditState}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                                          >
                                            <IconX className="h-4 w-4" />
                                            Vazgec
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                                {sellingPositionId === row.positionId && !row.sold ? (
                                  <tr className="border-t border-white/6 bg-amber-300/6 text-white">
                                    <td colSpan={9} className="px-5 py-4">
                                      <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-slate-950/30 p-4 lg:flex-row lg:items-end">
                                        <label className="flex-1">
                                          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Satis fiyati</span>
                                          <input
                                            value={salePriceInput}
                                            onChange={(event) => setSalePriceInput(event.target.value)}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-amber-300/60"
                                            placeholder="Ornek: 13.00"
                                          />
                                        </label>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => void handleSellSubmit(row.positionId)}
                                            disabled={savingSale || !salePriceInput}
                                            className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {savingSale ? "Kaydediliyor" : "Onayla"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setSellingPositionId(null)}
                                            className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                                          >
                                            Vazgec
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                              </Fragment>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-white/10 bg-white/5 text-sm font-semibold text-white">
                              <td className="px-5 py-4">Toplamlar</td>
                              <td className="px-4 py-4">{portfolio.summary.totalRequestedLot}</td>
                              <td className="px-4 py-4">{portfolio.summary.totalPurchasedLot}</td>
                              <td className="px-4 py-4">-</td>
                              <td className="px-4 py-4">{formatCurrency(portfolio.summary.totalCost, portfolio.summary.currency)}</td>
                              <td className="px-4 py-4">{formatCurrency(portfolio.summary.totalPendingCash, portfolio.summary.currency)}</td>
                              <td className="px-4 py-4">{formatCurrency(portfolio.summary.totalCurrentValue, portfolio.summary.currency)}</td>
                              <td className={`px-4 py-4 ${portfolio.summary.totalProfitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                                {formatCurrency(portfolio.summary.totalProfitLoss, portfolio.summary.currency)}
                              </td>
                              <td className="px-5 py-4" />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:hidden">
                      {portfolio.rows.map((row) => (
                        <article
                          key={row.positionId}
                          className={`rounded-3xl border p-4 shadow-lg shadow-black/10 ${row.sold ? "border-emerald-300/20 bg-emerald-400/8" : "border-white/10 bg-[#081b2a]/80"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className={`truncate text-lg font-semibold ${row.sold ? "text-emerald-200" : "text-white"}`}>{row.accountName}</h3>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${row.sold ? "bg-emerald-300/15 text-emerald-200" : "bg-cyan-300/15 text-cyan-100"}`}>
                                  {row.positionStatus}
                                </span>
                              </div>
                              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">{row.accountType || "Hesap tipi belirtilmedi"}</p>
                            </div>
                            <div className="flex gap-2">
                              {!row.sold ? (
                                <button
                                  type="button"
                                  onClick={() => openEditPanel(row)}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 text-cyan-100 transition hover:bg-cyan-400/10"
                                  aria-label={`${row.accountName} satirini duzenle`}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </button>
                              ) : null}
                              {!row.sold ? (
                                <button
                                  type="button"
                                  onClick={() => openSellPanel(row.positionId)}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 text-amber-200 transition hover:bg-amber-400/10"
                                  aria-label={`${row.accountName} satirini sat`}
                                >
                                  <IconShoppingCart className="h-4 w-4" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => requestDelete(row.positionId, row.accountName)}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-300/30 text-rose-200 transition hover:bg-rose-400/10"
                                aria-label={`${row.accountName} satirini sil`}
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <InfoCard label="Talep Lot" value={String(row.requestedLotCount)} />
                            <InfoCard label="Alınan Lot" value={row.purchasedLotCount === null ? "Bekliyor" : String(row.purchasedLotCount)} />
                            <InfoCard label="Lot Fiyati" value={formatCurrency(row.buyPrice, row.currency)} />
                            <InfoCard label="Hisse Maliyeti" value={formatCurrency(row.totalCost, row.currency)} />
                            <InfoCard label="Nakitte Kalan" value={formatCurrency(row.pendingCash, row.currency)} />
                            <InfoCard label="Guncel Deger" value={formatCurrency(row.currentValue, row.currency)} />
                            <InfoCard
                              label="Kar"
                              value={formatCurrency(row.profitLoss, row.currency)}
                              valueClassName={row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}
                            />
                            <InfoCard label="Durum" value={row.positionStatus} valueClassName={row.sold ? "text-emerald-200" : "text-cyan-100"} />
                          </div>

                          {editingPositionId === row.positionId && !row.sold ? (
                            <div className="mt-4 space-y-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/6 p-4">
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Hesap</span>
                                <select
                                  value={editDraft.accountId}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, accountId: event.target.value }))}
                                  className="w-full rounded-2xl border border-white/15 bg-[#0f3550] px-4 py-3 text-white outline-none"
                                >
                                  {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>{account.accountName}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Talep Edilen Lot</span>
                                <input
                                  value={editDraft.requestedLotCount}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, requestedLotCount: event.target.value }))}
                                  type="number"
                                  min="1"
                                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none"
                                />
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Satın Alınan Lot</span>
                                <input
                                  value={editDraft.purchasedLotCount}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, purchasedLotCount: event.target.value }))}
                                  type="number"
                                  min="0"
                                  placeholder="Bos birak"
                                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none"
                                />
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Lot Fiyati</span>
                                <input
                                  value={editDraft.buyPrice}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, buyPrice: event.target.value }))}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none"
                                />
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Not</span>
                                <input
                                  value={editDraft.notes}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, notes: event.target.value }))}
                                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none"
                                  placeholder="Opsiyonel"
                                />
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateSubmit(row.positionId)}
                                  disabled={savingEdit || !editDraft.accountId || !editDraft.requestedLotCount || !editDraft.buyPrice}
                                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <IconDeviceFloppy className="h-4 w-4" />
                                  {savingEdit ? "Kaydediliyor" : "Güncelle"}
                                </button>
                                <button
                                  type="button"
                                  onClick={resetEditState}
                                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                                >
                                  <IconX className="h-4 w-4" />
                                  Vazgec
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {sellingPositionId === row.positionId && !row.sold ? (
                            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/6 p-4">
                              <label className="block">
                                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/55">Satis fiyati</span>
                                <input
                                  value={salePriceInput}
                                  onChange={(event) => setSalePriceInput(event.target.value)}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-amber-300/60"
                                  placeholder="Ornek: 13.00"
                                />
                              </label>
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSellSubmit(row.positionId)}
                                  disabled={savingSale || !salePriceInput}
                                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {savingSale ? "Kaydediliyor" : "Onayla"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSellingPositionId(null)}
                                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                                >
                                  Vazgec
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      ))}

                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Toplamlar</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <InfoCard label="Talep Lot" value={String(portfolio.summary.totalRequestedLot)} />
                          <InfoCard label="Alınan Lot" value={String(portfolio.summary.totalPurchasedLot)} />
                          <InfoCard label="Toplam Maliyet" value={formatCurrency(portfolio.summary.totalCost, portfolio.summary.currency)} />
                          <InfoCard label="Guncel Deger" value={formatCurrency(portfolio.summary.totalCurrentValue, portfolio.summary.currency)} />
                          <InfoCard label="Nakitte Kalan" value={formatCurrency(portfolio.summary.totalPendingCash, portfolio.summary.currency)} />
                          <InfoCard
                            label="Toplam Kar"
                            value={formatCurrency(portfolio.summary.totalProfitLoss, portfolio.summary.currency)}
                            valueClassName={portfolio.summary.totalProfitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-rose-300/30 bg-rose-950/30 p-8 text-rose-200 backdrop-blur-xl">{error || "Kayit bulunamadi"}</div>
          )}
        </main>
        <AppModal
          open={modalState.open}
          variant={modalState.variant}
          tone={modalState.tone}
          title={modalState.title}
          description={modalState.description}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
          showCancel={modalState.showCancel}
          onConfirm={modalState.onConfirm}
          onClose={closeModal}
        />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-white/45">{label}</p>
      <p className={`mt-1 font-semibold text-white ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
