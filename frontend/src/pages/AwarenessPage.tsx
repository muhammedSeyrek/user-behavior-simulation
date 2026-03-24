import { useLocation, useNavigate } from "react-router-dom";
import { RoundResult } from "../api/client";

interface LocationState {
  rounds: RoundResult[];
}

export default function AwarenessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state?.rounds?.length) {
    navigate("/");
    return null;
  }

  const { rounds } = state;
  const correctCount = rounds.filter((r) => {
    const isPhishing = r.content.type === "phishing";
    return (
      (isPhishing && (r.action === "reported_phishing" || r.action === "ignored")) ||
      (!isPhishing && r.action === "clicked_link")
    );
  }).length;
  const score = Math.round((correctCount / rounds.length) * 100);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Genel skor */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--gray-50)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Simülasyon Tamamlandı — {rounds.length} E-Posta
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Farkındalık Raporu
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: score >= 80 ? "var(--green-50)" : score >= 60 ? "var(--blue-60)" : "var(--red-60)",
              }}
            >
              {score}%
            </span>
            <span style={{ fontSize: 14, color: "var(--gray-60)" }}>
              {correctCount}/{rounds.length} doğru karar
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--gray-20)",
              borderRadius: 3,
              overflow: "hidden",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${score}%`,
                background: score >= 80 ? "var(--green-50)" : score >= 60 ? "var(--blue-60)" : "var(--red-60)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Tur özeti tablosu */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--gray-50)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Tur Detayları
          </p>

          {rounds.map((r) => {
            const isPhishing = r.content.type === "phishing";
            const correct =
              (isPhishing && (r.action === "reported_phishing" || r.action === "ignored")) ||
              (!isPhishing && r.action === "clicked_link");
            const actionLabel =
              r.action === "clicked_link"
                ? "Bağlantıya tıkladı"
                : r.action === "reported_phishing"
                ? "Phishing raporladı"
                : "Görmezden geldi";

            return (
              <div
                key={r.round}
                style={{
                  borderLeft: `3px solid ${correct ? "var(--green-50)" : "var(--red-60)"}`,
                  paddingLeft: 16,
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: r.round < rounds.length ? "1px solid var(--gray-10)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--gray-50)",
                        letterSpacing: "0.04em",
                        marginRight: 10,
                      }}
                    >
                      TUR {r.round}
                    </span>
                    <span
                      className={`tag ${isPhishing ? "tag-danger" : "tag-success"}`}
                      style={{ fontSize: 10 }}
                    >
                      {isPhishing ? "Phishing" : "Meşru"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: correct ? "var(--green-50)" : "var(--red-60)",
                      fontWeight: 600,
                    }}
                  >
                    {correct ? "✓ Doğru" : "✗ Hatalı"}
                  </span>
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--gray-90)" }}>
                  {r.content.subject}
                </p>
                <p style={{ fontSize: 12, color: "var(--gray-60)", marginBottom: 8 }}>
                  {r.content.sender_name} &lt;{r.content.sender_email}&gt;
                </p>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--gray-70)" }}>
                  <span>Karar: <strong>{actionLabel}</strong></span>
                  <span>Emin: <strong>{r.confidence_score}/5</strong></span>
                  <span>Süre: <strong>{(r.time_to_action_ms / 1000).toFixed(1)}s</strong></span>
                </div>

                {isPhishing && r.content.warning_signs.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 11, color: "var(--red-60)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                      Uyarı İşaretleri
                    </p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                      {r.content.warning_signs.map((sign, i) => (
                        <li key={i} style={{ fontSize: 12, color: "var(--gray-70)", display: "flex", gap: 8 }}>
                          <span style={{ color: "var(--red-60)", flexShrink: 0 }}>→</span>
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Phishing tanıma rehberi */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, marginBottom: 20 }}>Phishing'i nasıl anlarsınız?</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 0,
              border: "1px solid var(--gray-20)",
            }}
          >
            {TIPS.map((tip, i) => {
              const isLastRow = i >= TIPS.length - (TIPS.length % 2 === 0 ? 2 : 1);
              const isRight = i % 2 === 1;
              return (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRight: isRight ? "none" : "1px solid var(--gray-20)",
                    borderBottom: isLastRow ? "none" : "1px solid var(--gray-20)",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--blue-60)", marginBottom: 6 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gray-70)", lineHeight: 1.6 }}>{tip.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn-primary"
            style={{ padding: "12px 40px", justifyContent: "center" }}
            onClick={() => navigate("/")}
          >
            Simülasyonu Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}

const TIPS = [
  { title: "Gönderen adresini doğrulayın", desc: "Gönderen adını değil, e-posta adresini kontrol edin. Resmi kurumlar kendi domain'lerini kullanır." },
  { title: "Aciliyet baskısına dikkat", desc: "'Hemen yapın', '24 saat içinde' gibi ifadeler phishing'in klasik göstergesidir." },
  { title: "Bağlantıları tıklamadan inceleyin", desc: "Fare imlecini linkin üzerine getirin. URL'nin beklediğiniz siteye gittiğini doğrulayın." },
  { title: "Kişiselleştirme yoksa şüphelenin", desc: "Meşru kurumlar sizi adınızla selamlar. 'Sayın Müşterimiz' phishing işareti olabilir." },
  { title: "Kimlik bilgisi taleplerini reddedin", desc: "Hiçbir meşru kurum e-posta yoluyla şifrenizi veya ödeme bilginizi istemez." },
  { title: "Şüphelenince raporlayın", desc: "Emin değilseniz güvenlik ekibinize veya BT departmanına bildirin. Tıklamayın." },
];
