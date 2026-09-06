"use client";

import { Check, Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * The browser's own "install" event, which isn't in the DOM typings yet.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppCardProps {
  /**
   * `card` is the full block on the profile page; `banner` is the slim strip at
   * the top of the home page, which can be dismissed.
   */
  variant?: "card" | "banner";
}

const DISMISSED_KEY = "qn:install-dismissed";

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

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    // Private mode or blocked storage — just show it.
    return false;
  }
}

/** The two taps that install the app on iOS, which never fires an install event. */
function IosSteps() {
  return (
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
  );
}

/**
 * Lets someone put Qulaynavbat on their home screen from inside the app.
 *
 * Browsers hide their own install button behind a menu most people never open,
 * so the site offers it where they are already looking. Chrome and friends hand
 * us the real prompt through `beforeinstallprompt`; iOS never fires it, so there
 * we show the two taps that do the same thing. Once installed, it disappears.
 */
export default function InstallAppCard({ variant = "card" }: InstallAppCardProps) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installedNow, setInstalledNow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  // What the browser is: unknown until mount, since every check is client-only
  // and the server renders the same markup for everyone.
  const [env, setEnv] = useState<{ installed: boolean; ios: boolean; dismissed: boolean } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnv({ installed: isStandalone(), ios: isIos(), dismissed: wasDismissed() });

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

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Nothing to remember it with — it will simply come back next visit.
    }
  };

  // Nothing to offer: already installed, or a browser that can neither prompt
  // nor be talked through it.
  if (!env || env.installed || installedNow) return null;
  if (!promptEvent && !env.ios) return null;
  if (variant === "banner" && (dismissed || env.dismissed)) return null;

  if (variant === "banner") {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/40 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Download size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">Ilovani o&apos;rnating</p>
            <p className="truncate text-xs text-muted-foreground">
              Qulaynavbat bosh ekraningizda, brauzersiz ochiladi.
            </p>
          </div>

          <button
            type="button"
            onClick={promptEvent ? () => void install() : () => setShowSteps((open) => !open)}
            className="btn-premium shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
          >
            {promptEvent ? "O'rnatish" : showSteps ? "Yopish" : "Qanday?"}
          </button>

          <button
            type="button"
            aria-label="Taklifni yopish"
            onClick={dismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors duration-200 hover:bg-white/50 hover:text-foreground/70 active:scale-90"
          >
            <X size={15} />
          </button>
        </div>

        {showSteps && !promptEvent && <IosSteps />}
      </section>
    );
  }

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
        <IosSteps />
      )}
    </section>
  );
}
