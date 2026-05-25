"use client";

import { useCallback, useState } from "react";

type Props = {
  achievementName: string;
};

export function ShareActionButtons({ achievementName }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadCard = useCallback(async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const card = document.getElementById("achievement-card");
      if (!card) return;
      const canvas = await html2canvas(card);
      const link = document.createElement("a");
      link.download = `${achievementName.replace(/\s+/g, "-").toLowerCase()}-interself.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [achievementName]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `Gw baru unlock achievement "${achievementName}" di InterSelf! 🏆\n\nLevel up produktivitasmu juga →`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [achievementName]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="w-full max-w-sm space-y-2">
      <button
        onClick={downloadCard}
        disabled={downloading}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
      >
        {downloading ? "Membuat gambar..." : "⬇️ Download Kartu Achievement"}
      </button>
      <button
        onClick={shareToTwitter}
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
      >
        𝕏 Share ke Twitter/X
      </button>
      <button
        onClick={copyLink}
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all"
      >
        {copied ? "✓ Link disalin!" : "🔗 Salin link share"}
      </button>
    </div>
  );
}
