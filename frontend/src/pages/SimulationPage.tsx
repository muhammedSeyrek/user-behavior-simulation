import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { interactionApi, RoundResult, sessionApi, SimulationContent } from "../api/client";

type Action = "clicked_link" | "reported_phishing" | "ignored" | "submitted_form" | "closed_tab";

const MOTIVATION_OPTIONS = [
  "Gönderenin e-posta adresi şüpheli göründü",
  "Bağlantı URL'si yanlış / şüpheli",
  "E-postanın dili veya tonu şüpheli",
  "Aciliyet / tehdit ifadeleri içeriyordu",
  "Tanıdık bir kurum / kişi gibi görünüyordu",
  "İçgüdüme göre hareket ettim",
];

// ── Karar-Sonrası Overlay ─────────────────────────────────────────────────────
function PostDecisionOverlay({
  action,
  round,
  total,
  onSubmit,
}: {
  action: Action;
  round: number;
  total: number;
  onSubmit: (confidence: number, motivation: string[]) => void;
}) {
  const [confidence, setConfidence] = useState(0);
  const [motivation, setMotivation] = useState<string[]>([]);

  const toggle = (opt: string) =>
    setMotivation((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );

  const canSubmit = confidence > 0 && motivation.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{ maxWidth: 520, width: "100%", padding: 28 }}
      >
        {/* İlerleme */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--gray-50)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Tur {round} / {total} — Karar kaydedildi
        </div>

        {/* Güven skoru */}
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
          Bu karardan ne kadar emindiniz?
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setConfidence(n)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: `2px solid ${confidence === n ? "var(--blue-60)" : "var(--gray-20)"}`,
                background: confidence === n ? "var(--blue-60)" : "transparent",
                color: confidence === n ? "#fff" : "var(--gray-70)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--gray-50)",
            marginTop: -20,
            marginBottom: 24,
          }}
        >
          <span>Hiç emin değilim</span>
          <span>Çok eminim</span>
        </div>

        {/* Motivasyon */}
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
          Kararınızı en çok ne etkiledi? (birden fazla seçebilirsiniz)
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {MOTIVATION_OPTIONS.map((opt) => {
            const selected = motivation.includes(opt);
            return (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  border: `1px solid ${selected ? "var(--blue-60)" : "var(--gray-20)"}`,
                  background: selected ? "var(--blue-10)" : "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--gray-80)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(opt)}
                  style={{ accentColor: "var(--blue-60)" }}
                />
                {opt}
              </label>
            );
          })}
        </div>

        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={!canSubmit}
          onClick={() => onSubmit(confidence, motivation)}
        >
          {round < total ? `Sonraki E-postaya Geç (${round + 1}/${total})` : "Ankete Geç"}
        </button>
      </div>
    </div>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { session_ids?: string[]; participant_id?: string } | null;
  const session_ids = state?.session_ids ?? [];
  const participant_id = state?.participant_id ?? "";
  const TOTAL = session_ids.length;

  const [round, setRound] = useState(0);          // 0-indexed
  const [content, setContent] = useState<SimulationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const startRef = useRef<number>(Date.now());

  // İçerik yükle
  useEffect(() => {
    if (!session_ids.length) { navigate("/"); return; }
    setLoading(true);
    setContent(null);
    setAction(null);
    startRef.current = Date.now();
    sessionApi
      .getContent(session_ids[round])
      .then((res) => setContent(res.content))
      .catch(() => setError("İçerik yüklenemedi."))
      .finally(() => setLoading(false));
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleOverlaySubmit(confidence: number, motivation: string[]) {
    if (!content || !action || submitting) return;
    setSubmitting(true);

    const elapsed = Date.now() - startRef.current;
    await interactionApi.log({
      session_id: session_ids[round],
      action,
      time_to_action_ms: elapsed,
      confidence_score: confidence,
      decision_motivation: motivation,
    });

    const result: RoundResult = {
      round: round + 1,
      session_id: session_ids[round],
      action,
      content,
      confidence_score: confidence,
      decision_motivation: motivation,
      time_to_action_ms: elapsed,
    };
    const newRounds = [...rounds, result];
    setRounds(newRounds);
    setSubmitting(false);

    if (round + 1 < TOTAL) {
      setRound((r) => r + 1);
    } else {
      navigate("/survey", { state: { rounds: newRounds, participant_id } });
    }
  }

  // ── Yükleme / Hata durumları ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--gray-50)" }}>
        Yükleniyor...
      </div>
    );
  }
  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 500 }}>
          <div className="notification notif-danger">
            <span className="notification-label">Hata</span>
            <span>{error}</span>
          </div>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }
  if (!content) return null;

  return (
    <div className="page">
      {action && (
        <PostDecisionOverlay
          action={action}
          round={round + 1}
          total={TOTAL}
          onSubmit={handleOverlaySubmit}
        />
      )}

      <div className="container" style={{ maxWidth: content.format === "web" ? 780 : 680 }}>
        {/* İlerleme bandı */}
        <div className="notification notif-warning" style={{ marginBottom: 24, alignItems: "center" }}>
          <span className="notification-label">Simülasyon</span>
          <span style={{ flex: 1 }}>
            {content.format === "web" ? "Web Sayfası" : "E-posta"} {round + 1} / {TOTAL} — Gerçek değildir, araştırma amaçlıdır.
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gray-60)", whiteSpace: "nowrap" }}>
            {"█".repeat(round + 1)}{"░".repeat(TOTAL - round - 1)}
          </span>
        </div>

        {content.format === "web" ? (
          /* ── Web Sayfası Görünümü ─────────────────────────────────────── */
          <div className="card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
            {/* Sahte tarayıcı çubuğu */}
            <div style={{ background: "var(--gray-15, #e8e8e8)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--gray-20)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: "white", border: "1px solid var(--gray-30)", borderRadius: 4, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--gray-50)" }}>🔒</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-70)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {content.fake_url}
                </span>
              </div>
            </div>

            {/* Sahte sayfa içeriği */}
            <div style={{ padding: "32px 40px" }}>
              {/* Marka başlığı */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{ fontSize: 28 }}>{content.favicon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-100)" }}>{content.brand}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gray-50)" }}>{content.page_title}</div>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--gray-100)" }}>{content.headline}</h2>
              <p style={{ fontSize: 13, color: "var(--gray-60)", marginBottom: 24, lineHeight: 1.5 }}>{content.subtext}</p>

              {/* Form alanları */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                {content.fields?.map((f, i) => (
                  <div key={i}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--gray-70)", marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      disabled={!!action}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--gray-20)", fontSize: 13, color: "var(--gray-80)", background: action ? "var(--gray-10)" : "white", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px", marginBottom: 10 }}
                disabled={!!action}
                onClick={() => setAction("submitted_form")}
              >
                {content.submit_text}
              </button>
            </div>
          </div>
        ) : (
          /* ── E-posta Görünümü ─────────────────────────────────────────── */
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ borderBottom: "1px solid var(--gray-20)", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, background: "var(--gray-90)", color: "var(--gray-10)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                  {content.sender_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{content.sender_name}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-50)" }}>az önce</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--gray-70)" }}>{content.sender_email}</div>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-100)", marginTop: 14 }}>{content.subject}</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--gray-70)", lineHeight: 1.75, whiteSpace: "pre-line", marginBottom: 24 }}>{content.body}</div>
            <div style={{ background: "var(--gray-10)", border: "1px solid var(--gray-20)", padding: 16 }}>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 16px" }} disabled={!!action} onClick={() => setAction("clicked_link")}>
                {content.link_text}
              </button>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray-50)", marginTop: 8, textAlign: "center" }}>
                {content.link_url === "#simulation-click" ? "https://..." : content.link_url}
              </div>
            </div>
          </div>
        )}

        {/* Karar paneli */}
        <div className="card">
          <p style={{ fontSize: 13, color: "var(--gray-70)", marginBottom: 14, fontWeight: 500 }}>
            {content.format === "web" ? "Bu sayfayı nasıl değerlendiriyorsunuz?" : "Bu e-postayı nasıl değerlendiriyorsunuz?"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {content.format === "web" ? (
              <button
                className="btn-outline"
                style={{ flex: 1, minWidth: 180, justifyContent: "center" }}
                disabled={!!action}
                onClick={() => setAction("closed_tab")}
              >
                Sekmeyi Kapat / Geri Dön
              </button>
            ) : (
              <>
                <button
                  className="btn-danger"
                  style={{ flex: 1, minWidth: 180, justifyContent: "center" }}
                  disabled={!!action}
                  onClick={() => setAction("reported_phishing")}
                >
                  Phishing Olarak Raporla
                </button>
                <button
                  className="btn-outline"
                  style={{ flex: 1, minWidth: 180, justifyContent: "center" }}
                  disabled={!!action}
                  onClick={() => setAction("ignored")}
                >
                  Sil / Görmezden Gel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
