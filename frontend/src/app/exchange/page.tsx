"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconCurrencyDollar, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

export default function ExchangePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20"
                >
                  <IconArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-ivosis-500 to-ivosis-600 rounded-lg flex items-center justify-center">
                    <IconCurrencyDollar className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Borsa & Döviz</h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title Card */}
          <div
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 opacity-0"
            style={{
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-ivosis-500 to-ivosis-600 rounded-full flex items-center justify-center">
                <IconCurrencyDollar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Döviz Kurları & Borsa</h2>
                <p className="text-ivosis-200 mt-1">Anlık döviz kurları ve borsa verilerini takip edin</p>
              </div>
            </div>
          </div>

          {/* Exchange Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.1s forwards",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white/80 text-sm font-medium">USD/TRY</h3>
                  <p className="text-2xl font-bold text-white mt-1">-</p>
                </div>
                <div className="w-10 h-10 bg-greens-500/20 rounded-lg flex items-center justify-center">
                  <IconTrendingUp className="w-5 h-5 text-greens-400" />
                </div>
              </div>
              <p className="text-greens-400 text-sm">Dolar</p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.2s forwards",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white/80 text-sm font-medium">EUR/TRY</h3>
                  <p className="text-2xl font-bold text-white mt-1">-</p>
                </div>
                <div className="w-10 h-10 bg-greens-500/20 rounded-lg flex items-center justify-center">
                  <IconTrendingUp className="w-5 h-5 text-greens-400" />
                </div>
              </div>
              <p className="text-greens-400 text-sm">Euro</p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.3s forwards",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white/80 text-sm font-medium">BIST 100</h3>
                  <p className="text-2xl font-bold text-white mt-1">-</p>
                </div>
                <div className="w-10 h-10 bg-reds-500/20 rounded-lg flex items-center justify-center">
                  <IconTrendingDown className="w-5 h-5 text-reds-400" />
                </div>
              </div>
              <p className="text-reds-400 text-sm">Borsa İstanbul</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.4s forwards",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Altın Fiyatları</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Gram Altın</span>
                  <span className="text-white font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Çeyrek Altın</span>
                  <span className="text-white font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Yarım Altın</span>
                  <span className="text-white font-semibold">-</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.5s forwards",
              }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Kripto Paralar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Bitcoin (BTC)</span>
                  <span className="text-white font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Ethereum (ETH)</span>
                  <span className="text-white font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Ripple (XRP)</span>
                  <span className="text-white font-semibold">-</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 opacity-0"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.6s forwards",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Piyasa Takibi</h3>
            <p className="text-white/70 mb-4">
              Bu sayfada anlık döviz kurları, altın fiyatları, kripto para değerleri 
              ve borsa endekslerini takip edebilirsiniz. Tüm veriler gerçek zamanlı 
              olarak güncellenecektir.
            </p>
            <div className="flex items-center gap-2 text-ivosis-400">
              <IconCurrencyDollar className="w-5 h-5" />
              <span className="text-sm">Döviz ve borsa verileri yakında aktif olacak</span>
            </div>
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
    </div>
  );
}
