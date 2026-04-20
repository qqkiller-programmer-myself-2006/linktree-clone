"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { trackClick, getClickCounts } from "@/lib/analytics";
import config from "@/config.json";

type Lang = "th" | "en";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function LinktreePage() {
  const [lang, setLang] = useState<Lang>("th");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getClickCounts().then(setCounts);
  }, []);

  const handleClick = useCallback(async (id: string, url: string) => {
    await trackClick(id);
    setCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: config.profile.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const p = config.profile;
  const t = (th: string, en: string) => lang === "th" ? th : en;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: config.theme.background }}>
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ background: config.theme.accent, filter: "blur(80px)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 animate-pulse" style={{ background: config.theme.accentSecondary || config.theme.accent, filter: "blur(100px)", animationDelay: "1s" }} />
      </div>

      {/* Lang + Share */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setLang(l => l === "th" ? "en" : "th")} className="glass-card px-3 py-1.5 rounded-full text-xs text-slate-300 hover:text-white transition-all">
          {lang === "th" ? "🇺🇸 EN" : "🇹🇭 TH"}
        </button>
        <button onClick={handleShare} className="glass-card px-3 py-1.5 rounded-full text-xs text-slate-300 hover:text-white transition-all">
          {copied ? "✅ Copied!" : "📤 Share"}
        </button>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-start py-14 px-4">
        <div className="w-full max-w-sm flex flex-col gap-5">

          {/* Profile */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-transparent relative">
                <Image src={p.avatar} alt={p.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold" style={{ background: config.theme.accent, fontFamily: "'Prompt',sans-serif" }}>IQ</div>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a0f]" />
            </div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-1.5" style={{ fontFamily: "'Prompt',sans-serif" }}>
              {t(p.name, p.nameEn)}
              {p.verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" strokeWidth="3" stroke="white" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </h1>
            <p className="text-sm mt-1" style={{ color: config.theme.accent }}>{t(p.role, p.roleEn)}</p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-line">{t(p.bio, p.bioEn)}</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600">links</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            {config.links.map((link, i) => (
              <button
                key={link.id}
                onClick={() => handleClick(link.id, link.url)}
                className="group w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-98 text-left"
                style={{
                  background: link.featured ? `${link.color}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${link.featured ? link.color + "40" : "rgba(255,255,255,0.07)"}`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Icon */}
                <span className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${link.color}20`, color: link.color }}>
                  <span className="text-lg">{link.emoji || "🔗"}</span>
                </span>

                {/* Label */}
                <span className="flex-1">
                  <span className="text-sm font-medium text-slate-200 block">
                    {t(link.labelTh, link.labelEn)}
                    {link.badge && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${link.color}25`, color: link.color }}>
                        {link.badge}
                      </span>
                    )}
                  </span>
                </span>

                {/* View Count */}
                {counts[link.id] !== undefined && (
                  <span className="text-xs text-slate-600 flex-shrink-0 flex items-center gap-1">
                    👁️ {formatCount(counts[link.id])}
                  </span>
                )}

                {/* Arrow */}
                <span className="text-slate-700 group-hover:text-slate-400 transition-colors text-xs flex-shrink-0">→</span>
              </button>
            ))}
          </div>

          {/* Services */}
          {config.services?.length > 0 && (
            <div>
              <p className="text-xs text-slate-600 text-center mb-3 uppercase tracking-widest">{t("บริการ","Services")}</p>
              <div className="grid grid-cols-2 gap-2">
                {config.services.map((s: { icon: string; labelTh: string; labelEn: string; price: string }) => (
                  <a key={s.labelEn} href={config.profile.fastwork} target="_blank" rel="noopener noreferrer"
                    className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs text-slate-300 font-medium">{t(s.labelTh, s.labelEn)}</span>
                    <span className="text-xs font-bold" style={{ color: config.theme.accent }}>{s.price}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-700 pb-4">© 2025 IQ — ธีรภัทร เตโช</p>
        </div>
      </main>
    </div>
  );
}
