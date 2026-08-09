import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AuthView from "@/components/auth/AuthView";
import MeshBackground from "@/components/layout/MeshBackground";

export const metadata: Metadata = {
  title: "Kirish",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <MeshBackground />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="osonNavbat" width={872} height={282} priority className="h-9 w-auto" />
        </Link>

        <div className="rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-8">
          <AuthView />
        </div>
      </div>
    </div>
  );
}
