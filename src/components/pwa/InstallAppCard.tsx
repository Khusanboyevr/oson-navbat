"use client";

import { Check, Download, Share, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * The browser's own "install" event, which isn't in the DOM typings yet.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari predates the display-mode query.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Lets someone put Qulaynavbat on their home screen from inside the app.
 *
 * Browsers hide their own install button behind a menu most people never open,
 * so the site offers it where they are already looking. Chrome and friends hand
 * us the real prompt through `beforeinstallprompt`; iOS never fires it, so there
 * we show the two taps that do the same thing. Once installed, the card is gone.
 */
export default function InstallAppCard() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installedNow, setInstalledNow] = useState(false);
  // What the browser is: unknown until mount, since both checks are client-only
  // and the server renders the same markup for everyone.
  const [env, setEnv] = useState<{ installed: boolean; ios: boolean } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnv({ installed: isStandalone(), ios: isIos() });

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalledNow(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event is single-use whichever way it went.
    setPromptEvent(null);
    if (outcome === "accepted") setInstalledNow(true);
  };

  // Nothing to offer: already installed, or a browser that can neither prompt
  // nor be talked through it.
  if (!env || env.installed || installedNow) return null;
  if (!promptEvent && !env.ios) return null;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Download size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">Ilovani yuklab oling</h2>
          <p className="text-sm text-muted-foreground">
            Qulaynavbat telefoningizga o&apos;rnatiladi va oddiy ilova kabi ochiladi.
          </p>
        </div>
      </div>

      {promptEvent ? (
        <button
          type="button"
          onClick={() => void install()}
          className="btn-premium flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
        >
          <Download size={16} />
          O&apos;rnatish
        </button>
      ) : (
        <ol className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/40 p-4 text-sm text-foreground/80">
          <li className="flex items-center gap-2">
            <Share size={15} className="shrink-0 text-primary" />
            Pastdagi <span className="font-semibold">Ulashish</span> tugmasini bosing
          </li>
          <li className="flex items-center gap-2">
            <SquarePlus size={15} className="shrink-0 text-primary" />
            <span className="font-semibold">&quot;Bosh ekranga qo&apos;shish&quot;</span>ni tanlang
          </li>
          <li className="flex items-center gap-2">
            <Check size={15} className="shrink-0 text-primary" />
            Ilova bosh ekraningizda paydo bo&apos;ladi
          </li>
        </ol>
      )}
    </section>
  );
}
