import type { Metadata } from "next";
import Logo from "@/components/layout/Logo";
import MeshBackground from "@/components/layout/MeshBackground";
import BarberRegisterForm from "@/components/register/BarberRegisterForm";

export const metadata: Metadata = {
  title: "Usta bo'lib ro'yxatdan o'tish",
  description:
    "Sartarosh va go'zallik ustalari uchun ro'yxatdan o'tish — ma'lumotlaringizni yuboring, tasdiqlangach profilingiz va xaritadagi joyingiz avtomatik yaratiladi.",
};

/** The dedicated worker sign-up link, separate from the customer login page. */
export default function BarberRegisterPage() {
  return (
    <div className="relative flex min-h-screen items-start justify-center p-4 py-10">
      <MeshBackground />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Logo iconClassName="h-9 w-auto" textClassName="text-xl" />
        </div>

        <div className="rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-8">
          <BarberRegisterForm />
        </div>
      </div>
    </div>
  );
}
