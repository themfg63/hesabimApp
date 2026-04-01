"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconChartCandle, IconChevronRight, IconPlus } from "@tabler/icons-react";

import { getIpos } from "@/services/api";
import type { IpoSummaryItem } from "@/types/ipo";

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
              <div className="flex items-center gap-8">
                <button
                  onClick={() => router.push("/exchange")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20"
                >
                  <IconArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">Portföyüm</h1>
                </div>
                <Link
                  href="/yeniArzEkle"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-2 font-semibold text-slate-900 transition hover:bg-cyan-200"
                >
                  <IconPlus className="h-5 w-5" />
                  Yeni Arz
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                <IconChartCandle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="mt-1 text-3xl font-bold text-white">Portföyüm</h2>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-white/70">Arz listesi yukleniyor...</div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-300/30 bg-rose-950/30 p-6 text-rose-200">{error}</div>
              ) : ipos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 p-8 text-center text-white/70">
                  Henüz halka arz eklemedin. İlk kaydı oluşturup hesap bazlı lot dağılımını takibe başlayabilirsin.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {ipos.map((ipo) => {
                    const isPositive = ipo.totalProfitLoss >= 0;

                    return (
                      <Link
                        key={ipo.id}
                        href={`/halkaArzListesi/${ipo.id}`}
                        className="group rounded-3xl border border-white/15 bg-[#0b1f31]/85 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/55">{ipo.code}</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">{ipo.companyName || ipo.code}</h3>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-base font-semibold ${isPositive ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
                            {formatCurrency(ipo.totalProfitLoss, ipo.currency)}
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/72">
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Toplam Lot</p>
                            <p className="mt-1 text-xl font-semibold text-white">{ipo.totalLot}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Hesap Sayısı</p>
                            <p className="mt-1 text-xl font-semibold text-white">{ipo.positionCount}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Toplam Maliyet</p>
                            <p className="mt-1 font-semibold text-white">{formatCurrency(ipo.totalCost, ipo.currency)}</p>
                          </div>
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-white/65">Guncel Deger</p>
                            <p className="mt-1 font-semibold text-white">{formatCurrency(ipo.totalCurrentValue, ipo.currency)}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm text-white/55">
                          <span>Detaya git</span>
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
    </div>
  );
}
