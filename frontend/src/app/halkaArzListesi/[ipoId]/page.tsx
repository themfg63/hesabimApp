"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconChartBar,
  IconCoin,
  IconCurrencyLira,
  IconDiscountCheck,
  IconRefresh,
  IconShoppingCart,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";

import { deleteIpoPosition, getIpoDetail, sellIpoPosition, updateIpoPrice } from "@/services/api";
import type { IpoPortfolioResponse, IpoPositionRow } from "@/types/ipo";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function IpoDetailPage() {
  const router = useRouter();
  const params = useParams<{ ipoId: string }>();
  const ipoId = params.ipoId;

  const [portfolio, setPortfolio] = useState<IpoPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [sellingPositionId, setSellingPositionId] = useState<number | null>(null);
  const [salePriceInput, setSalePriceInput] = useState("");
  const [savingSale, setSavingSale] = useState(false);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    void loadPage();
  }, [ipoId, router]);

  const handlePriceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSavingPrice(true);
      setError(null);
      await updateIpoPrice(ipoId, Number(priceInput));
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Fiyat guncellenemedi");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleDelete = async (positionId: number) => {
    try {
      setError(null);
      await deleteIpoPosition(positionId);
      await loadPage();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Pozisyon silinemedi");
    }
  };

  const openSellPanel = (positionId: number) => {
    setSellingPositionId((current) => (current === positionId ? null : positionId));
    setSalePriceInput("");
  };

  const handleSellSubmit = async (positionId: number) => {
    try {
      setSavingSale(true);
      setError(null);
      await sellIpoPosition(positionId, { salePrice: Number(salePriceInput) });
      setSellingPositionId(null);
      setSalePriceInput("");
      await loadPage();
    } catch (sellError) {
      setError(sellError instanceof Error ? sellError.message : "Satis yapilamadi");
    } finally {
      setSavingSale(false);
    }
  };

  const summaryCards = portfolio
    ? [
        {
          label: "Arz Fiyatı",
          value: formatCurrency(portfolio.ipo.offeringPrice, portfolio.ipo.currency),
          icon: IconCoin,
        },
        {
          label: "Güncel Fiyat",
          value: formatCurrency(portfolio.ipo.currentPrice, portfolio.ipo.currency),
          icon: IconCurrencyLira,
        },
        {
          label: "Toplam Maliyet",
          value: formatCurrency(portfolio.summary.totalCost, portfolio.summary.currency),
          icon: IconWallet,
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

              <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
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
                          Hesap bazlı lot dağılımını, maliyetini ve aktif veya satılmış durumunu tek ekranda izle.
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
              </section>

              <section className="rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Hesap Bazlı Dağılım</p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Lot Tablosu</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80">{portfolio.rows.length} Hesap</div>
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80">{portfolio.summary.totalLot} Lot</div>
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
                              <th className="px-5 py-4">Lot Sayısı</th>
                              <th className="px-5 py-4">Lot Fiyatı</th>
                              <th className="px-5 py-4">Satış Fiyatı</th>
                              <th className="px-5 py-4">Güncel Fiyat</th>
                              <th className="px-5 py-4">Toplam Tutar</th>
                              <th className="px-5 py-4">Güncel Tutar</th>
                              <th className="px-5 py-4">Kâr</th>
                              <th className="px-5 py-4 text-center">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolio.rows.map((row) => (
                              <>
                                <tr
                                  key={row.positionId}
                                  className={`border-t border-white/6 align-top text-sm ${row.sold ? "bg-emerald-400/5 text-white/70" : "text-white"}`}
                                >
                                  <td className="px-5 py-5">
                                    <div className={`font-semibold ${row.sold ? "text-emerald-200" : "text-white"}`}>{row.accountName}</div>
                                    <div className="mt-1 text-xs text-white/55">{row.accountType || "Hesap tipi belirtilmedi"}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${row.sold ? "bg-emerald-300/15 text-emerald-200" : "bg-cyan-300/15 text-cyan-100"}`}>
                                        {row.positionStatus}
                                      </span>
                                      {row.sold && row.salePrice !== null ? (
                                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70">
                                          Satış: {formatCurrency(row.salePrice, row.currency)}
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>
                                  <td className="px-4 py-5">{row.lotCount}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.buyPrice, row.currency)}</td>
                                  <td className="px-4 py-5">{row.salePrice !== null ? formatCurrency(row.salePrice, row.currency) : "-"}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.currentPrice, row.currency)}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.totalCost, row.currency)}</td>
                                  <td className="px-4 py-5">{formatCurrency(row.currentValue, row.currency)}</td>
                                  <td className={`px-4 py-5 font-semibold ${row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                                    {formatCurrency(row.profitLoss, row.currency)}
                                  </td>
                                  <td className="px-5 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                      {row.sold ? (
                                        <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 px-3 py-2 text-xs font-semibold text-emerald-200">
                                          <IconDiscountCheck className="h-4 w-4" />
                                          Satildi
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => openSellPanel(row.positionId)}
                                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
                                        >
                                          <IconShoppingCart className="h-4 w-4" />
                                          Satis Yap
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => void handleDelete(row.positionId)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
                                      >
                                        <IconTrash className="h-4 w-4" />
                                        Sil
                                      </button>
                                    </div>
                                  </td>
                                </tr>
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
                              </>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-white/10 bg-white/5 text-sm font-semibold text-white">
                              <td className="px-5 py-4">Toplamlar</td>
                              <td className="px-4 py-4">{portfolio.summary.totalLot}</td>
                              <td className="px-4 py-4">-</td>
                              <td className="px-4 py-4">-</td>
                              <td className="px-4 py-4">-</td>
                              <td className="px-4 py-4">{formatCurrency(portfolio.summary.totalCost, portfolio.summary.currency)}</td>
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
                                  onClick={() => openSellPanel(row.positionId)}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 text-amber-200 transition hover:bg-amber-400/10"
                                  aria-label={`${row.accountName} satirini sat`}
                                >
                                  <IconShoppingCart className="h-4 w-4" />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => void handleDelete(row.positionId)}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-300/30 text-rose-200 transition hover:bg-rose-400/10"
                                aria-label={`${row.accountName} satirini sil`}
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <InfoCard label="Lot" value={String(row.lotCount)} />
                            <InfoCard label="Lot Fiyati" value={formatCurrency(row.buyPrice, row.currency)} />
                            <InfoCard label="Guncel Fiyat" value={formatCurrency(row.currentPrice, row.currency)} />
                            <InfoCard label="Satis Fiyati" value={row.salePrice !== null ? formatCurrency(row.salePrice, row.currency) : "-"} />
                            <InfoCard label="Toplam Tutar" value={formatCurrency(row.totalCost, row.currency)} />
                            <InfoCard label="Guncel Tutar" value={formatCurrency(row.currentValue, row.currency)} />
                            <InfoCard
                              label="Kar"
                              value={formatCurrency(row.profitLoss, row.currency)}
                              valueClassName={row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}
                            />
                            <InfoCard label="Durum" value={row.positionStatus} valueClassName={row.sold ? "text-emerald-200" : "text-cyan-100"} />
                          </div>

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
                          <InfoCard label="Lot" value={String(portfolio.summary.totalLot)} />
                          <InfoCard
                            label="Toplam Kar"
                            value={formatCurrency(portfolio.summary.totalProfitLoss, portfolio.summary.currency)}
                            valueClassName={portfolio.summary.totalProfitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}
                          />
                          <InfoCard label="Toplam Maliyet" value={formatCurrency(portfolio.summary.totalCost, portfolio.summary.currency)} />
                          <InfoCard label="Guncel Tutar" value={formatCurrency(portfolio.summary.totalCurrentValue, portfolio.summary.currency)} />
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
