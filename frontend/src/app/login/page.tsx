"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/api";
import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { extractErrorMessage } from "@/services/errors";
import Link from "next/link";
import { IconUser, IconLock, IconEye, IconEyeOff, IconLogin } from "@tabler/icons-react";

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

const emptyModalState = (): FeedbackModalState => ({
  open: false,
  variant: "info",
  tone: "primary",
  title: "",
  description: "",
  confirmText: "Tamam",
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("rememberedEmail") ?? "" : ""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => (typeof window !== "undefined" ? Boolean(localStorage.getItem("rememberedEmail")) : false));
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());

  const closeModal = () => setModalState(emptyModalState());

  const openModal = (config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const response = await loginUser(email, password);

      if (response.accessToken) {
        localStorage.setItem("token", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("email", email);
        setLoading(false);
        openModal({
          variant: "success",
          tone: "success",
          title: "Giriş Başarılı",
          description: "Hoş geldiniz. Dashboard'a yönlendiriliyorsunuz...",
          confirmText: "Dashboard'a Git",
          onConfirm: () => {
            closeModal();
            router.push("/dashboard");
          },
        });

        window.setTimeout(() => {
          router.push("/dashboard");
        }, 1600);
      } else {
        setLoading(false);
        openModal({
          variant: "error",
          tone: "danger",
          title: "Giriş Başarısız",
          description: "Giriş başarısız. Yanıt geçersiz.",
          confirmText: "Tamam",
        });
      }
    } catch (err: unknown) {
      setLoading(false);
      openModal({
        variant: "error",
        tone: "danger",
        title: "Giriş Yapılamadı",
        description: extractErrorMessage(err, "Giriş yapılırken bir hata oluştu"),
        confirmText: "Tamam",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-ivosis-900 via-ivosis-800 to-natural-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivosis-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivosis-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ivosis-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md opacity-0 translate-y-5"
          style={{
            animation: "fadeInUp 0.6s ease-out forwards",
          }}
        >
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Logo Section */}
            <div className="bg-linear-to-br from-ivosis-600 to-ivosis-800 p-8 text-center">
              <div
                className="inline-block opacity-0 scale-90"
                style={{
                  animation: "fadeInScale 0.5s ease-out 0.2s forwards",
                }}
              >
              </div>
              <h1
                className="text-2xl font-bold text-white mb-2 opacity-0"
                style={{
                  animation: "fadeIn 0.5s ease-out 0.4s forwards",
                }}
              >
                KULLANICI GİRİŞİ
              </h1>
              <p
                className="text-ivosis-200 text-sm opacity-0"
                style={{
                  animation: "fadeIn 0.5s ease-out 0.5s forwards",
                }}
              >
                Sisteme giriş yapmak için bilgilerinizi girin
              </p>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div
                  className="opacity-0 -translate-y-5"
                  style={{
                    animation: "fadeInLeft 0.5s ease-out 0.6s forwards",
                  }}
                >
                  <label className="block text-white text-sm font-medium mb-2 px-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <IconUser className="w-5 h-5 text-ivosis-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@hesabimapp.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-ivosis-500 focus:border-transparent transition-all duration-300 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div
                  className="opacity-0 -translate-y-5"
                  style={{
                    animation: "fadeInLeft 0.5s ease-out 0.7s forwards",
                  }}
                >
                  <label className="block text-white text-sm font-medium mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <IconLock className="w-5 h-5 text-ivosis-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-ivosis-500 focus:border-transparent transition-all duration-300 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ivosis-400 hover:text-ivosis-300 transition-colors focus:outline-none z-10"
                    >
                      {showPassword ? (
                        <IconEyeOff className="w-5 h-5" />
                      ) : (
                        <IconEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div
                  className="flex items-center justify-between opacity-0"
                  style={{
                    animation: "fadeIn 0.5s ease-out 0.8s forwards",
                  }}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-ivosis-500 focus:ring-ivosis-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-2 text-white/80 text-sm hover:text-white transition-colors">
                      Beni Hatırla
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div
                  className="opacity-0 translate-y-5"
                  style={{
                    animation: "fadeInUp 0.5s ease-out 0.9s forwards",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-ivosis-500 to-ivosis-600 hover:from-ivosis-600 hover:to-ivosis-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Giriş Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <IconLogin className="w-5 h-5" />
                        <span>Giriş Yap</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Info */}
              <div
                className="mt-6 pt-6 border-t border-white/10 text-center opacity-0"
                style={{
                  animation: "fadeIn 0.5s ease-out 1s forwards",
                }}
              >
                <p className="text-white/60 text-sm">
                  Hesabınız yok mu?{" "}
                  <Link
                    href="/register"
                    className="text-ivosis-400 hover:text-ivosis-300 transition-colors"
                  >
                    Kayıt Olun
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="text-center mt-8 text-white/60 text-sm opacity-0"
            style={{
              animation: "fadeIn 0.5s ease-out 1.1s forwards",
            }}
          >
            <p>© 2026 HesabimApp. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>

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

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInScaleUp {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}