"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconLogout,
  IconUser,
  IconMail,
  IconShieldCheck,
  IconDashboard,
  IconBusinessplan,
  IconCurrencyDollar,
} from "@tabler/icons-react";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("email");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userEmail) {
      setEmail(userEmail);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-ivosis-900 via-ivosis-800 to-natural-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ivosis-200 border-t-ivosis-600 rounded-full animate-spin"></div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-ivosis-500 to-ivosis-600 rounded-lg flex items-center justify-center">
                  <IconDashboard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Anasayfa</h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-reds-500/20 hover:bg-reds-500/30 text-reds-300 rounded-lg transition-all duration-300 border border-reds-500/30 hover:border-reds-500/50"
              >
                <IconLogout className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          <div
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 opacity-0"
            style={{
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-ivosis-500 to-ivosis-600 rounded-full flex items-center justify-center">
                <IconUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hoş Geldiniz!</h2>
                <p className="text-ivosis-200">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-greens-400">
              <IconShieldCheck className="w-5 h-5" />
              <span className="text-sm">Güvenli oturum aktif</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stat Card 1 - Spending */}
            <button
              onClick={() => router.push("/spending")}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer text-left group"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.1s forwards",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white/80 text-lg font-bold group-hover:text-white transition-colors">
                  Harcamalar
                </h3>
                <div className="w-10 h-10 bg-ivosis-500/20 rounded-lg flex items-center justify-center group-hover:bg-ivosis-500/30 transition-colors">
                  <IconBusinessplan className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>

            {/* Stat Card 2 - Exchange */}
            <button
              onClick={() => router.push("/exchange")}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 opacity-0 hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer text-left group"
              style={{
                animation: "fadeInUp 0.6s ease-out 0.2s forwards",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white/80 text-lg font-bold group-hover:text-white transition-colors">
                  Borsa
                </h3>
                <div className="w-10 h-10 bg-ivosis-500/20 rounded-lg flex items-center justify-center group-hover:bg-ivosis-500/30 transition-colors">
                  <IconCurrencyDollar className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>
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
