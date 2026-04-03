"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser, IconUserPlus } from "@tabler/icons-react";

import { AppModal, type AppModalTone, type AppModalVariant } from "@/components/ui/app-modal";
import { registerUser } from "@/services/api";
import { extractErrorMessage } from "@/services/errors";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<FeedbackModalState>(emptyModalState());

  const closeModal = () => setModalState(emptyModalState());

  const openModal = (config: Omit<FeedbackModalState, "open">) => {
    setModalState({ open: true, ...config });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      openModal({
        variant: "warning",
        tone: "warning",
        title: "Form Uyarısı",
        description: "Şifreler eşleşmiyor.",
        confirmText: "Tamam",
      });
      return;
    }

    if (password.length < 6) {
      openModal({
        variant: "warning",
        tone: "warning",
        title: "Form Uyarısı",
        description: "Şifre en az 6 karakter olmalıdır.",
        confirmText: "Tamam",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser(name, email, password);

      if (!response.accessToken) {
        openModal({
          variant: "error",
          tone: "danger",
          title: "Kayıt Başarısız",
          description: "Kayıt başarısız. Yanıt geçersiz.",
          confirmText: "Tamam",
        });
        return;
      }

      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("email", email);

      openModal({
        variant: "success",
        tone: "success",
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu. Giriş ekranına yönlendiriliyorsunuz.",
        confirmText: "Girişe Git",
        onConfirm: () => {
          closeModal();
          router.push("/login");
        },
      });

      window.setTimeout(() => {
        router.push("/login");
      }, 1600);
    } catch (error: unknown) {
      openModal({
        variant: "error",
        tone: "danger",
        title: "Kayıt Olunamadı",
        description: extractErrorMessage(error, "Kayıt olurken bir hata oluştu"),
        confirmText: "Tamam",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-ivosis-900 via-ivosis-800 to-natural-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ivosis-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-ivosis-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform w-96 h-96 bg-ivosis-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md translate-y-5 opacity-0" style={{ animation: "fadeInUp 0.6s ease-out forwards" }}>
          <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="bg-linear-to-br from-ivosis-600 to-ivosis-800 p-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-white opacity-0" style={{ animation: "fadeIn 0.5s ease-out 0.4s forwards" }}>
                HESAP OLUŞTUR
              </h1>
              <p className="text-sm text-ivosis-200 opacity-0" style={{ animation: "fadeIn 0.5s ease-out 0.5s forwards" }}>
                Yeni hesap oluşturmak için bilgilerinizi girin
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="-translate-y-5 opacity-0" style={{ animation: "fadeInLeft 0.5s ease-out 0.6s forwards" }}>
                  <label className="mb-2 block text-sm font-medium text-white">Ad Soyad</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                      <IconUser className="h-5 w-5 text-ivosis-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ali Yılmaz"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-white/40 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ivosis-500"
                      required
                    />
                  </div>
                </div>

                <div className="-translate-y-5 opacity-0" style={{ animation: "fadeInLeft 0.5s ease-out 0.7s forwards" }}>
                  <label className="mb-2 block text-sm font-medium text-white">E-posta</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                      <IconMail className="h-5 w-5 text-ivosis-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ornek@hesabimapp.com"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-white/40 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ivosis-500"
                      required
                    />
                  </div>
                </div>

                <div className="-translate-y-5 opacity-0" style={{ animation: "fadeInLeft 0.5s ease-out 0.8s forwards" }}>
                  <label className="mb-2 block text-sm font-medium text-white">Şifre</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                      <IconLock className="h-5 w-5 text-ivosis-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-white/40 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ivosis-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform text-ivosis-400 transition-colors hover:text-ivosis-300 focus:outline-none"
                    >
                      {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="-translate-y-5 opacity-0" style={{ animation: "fadeInLeft 0.5s ease-out 0.9s forwards" }}>
                  <label className="mb-2 block text-sm font-medium text-white">Şifre Tekrar</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                      <IconLock className="h-5 w-5 text-ivosis-400" />
                    </div>
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(event) => setPasswordConfirm(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-white/40 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ivosis-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((current) => !current)}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform text-ivosis-400 transition-colors hover:text-ivosis-300 focus:outline-none"
                    >
                      {showPasswordConfirm ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="translate-y-5 opacity-0" style={{ animation: "fadeInUp 0.5s ease-out 1s forwards" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center space-x-2 rounded-xl bg-linear-to-r from-ivosis-500 to-ivosis-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-ivosis-600 hover:to-ivosis-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        <span>Kayıt Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <IconUserPlus className="h-5 w-5" />
                        <span>Kayıt Ol</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-white/10 pt-6 text-center opacity-0" style={{ animation: "fadeIn 0.5s ease-out 1.1s forwards" }}>
                <p className="text-sm text-white/60">
                  Zaten hesabınız var mı?{" "}
                  <Link href="/login" className="text-ivosis-400 transition-colors hover:text-ivosis-300">
                    Giriş Yapın
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-white/60 opacity-0" style={{ animation: "fadeIn 0.5s ease-out 1.2s forwards" }}>
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
      `}</style>
    </div>
  );
}
