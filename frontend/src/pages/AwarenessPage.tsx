import { useLocation, useNavigate } from "react-router-dom";
import { SimulationContent } from "../api/client";

type Action = "clicked_link" | "reported_phishing" | "ignored";

interface LocationState {
  action: Action;
  content: SimulationContent;
}

const ACTION_LABELS: Record<Action, string> = {
  clicked_link: "Bağlantıya tıkladı",
  reported_phishing: "Phishing olarak raporladı",
  ignored: "Görmezden geldi / Sildi",
};

export default function AwarenessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state) {
    navigate("/");
    return null;
  }

  const { action, content } = state;
  const isPhishing = content.type === "phishing";

  const wasCorrect =
    (isPhishing && (action === "reported_phishing" || action === "ignored")) ||
    (!isPhishing && action === "clicked_link");

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        {/* Sonuç başlığı */}
        <div
          style={{
            borderLeft: `3px solid ${wasCorrect ? "var(--green-50)" : "var(--red-60)"}`,
            paddingLeft: 20,
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: wasCorrect ? "var(--green-50)" : "var(--red-60)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {wasCorrect ? "Doğru Karar" : "Hatalı Karar"}
          </p>
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>
            {wasCorrect
              ? action === "reported_phishing"
                ? "İyi iş — tehdit raporlandı."
                : isPhishing
                ? "E-postayı sildiniz."
                : "Doğru yanıt."
              : isPhishing
              ? "Phishing bağlantısına tıkladınız."
              : "Meşru e-posta raporlandı."}
          </h1>
          <p style={{ color: "var(--gray-70)", fontSize: 14 }}>
            Kararınız: <strong>{ACTION_LABELS[action]}</strong>
          </p>
        </div>

        {/* Sonuç bildirimi */}
        <div
          className={`notification ${wasCorrect ? "notif-success" : "notif-danger"}`}
          style={{ marginBottom: 24 }}
        >
          <span className="notification-label">
            {wasCorrect ? "Bilgi" : "Uyarı"}
          </span>
          <span>
            {isPhishing ? (
              wasCorrect ? (
                action === "reported_phishing" ? (
                  <>
                    Bu bir <strong>phishing e-postasıydı</strong>. Raporlamak,
                    güvenlik ekibini uyarır ve organizasyonuzu korur.
                  </>
                ) : (
                  <>
                    Bu bir <strong>phishing e-postasıydı</strong>. Silmek tehlikeyi
                    atlattırır; ancak raporlamak daha etkili bir önlem olurdu.
                  </>
                )
              ) : (
                <>
                  Bu bir <strong>phishing (oltalama) e-postasıydı</strong>. Gerçek
                  bir senaryoda bağlantıya tıklamak kimlik bilgilerinizin çalınmasına
                  yol açabilirdi.
                </>
              )
            ) : wasCorrect ? (
              <>
                Bu <strong>meşru bir e-postaydı</strong>. Bağlantıya tıklamak
                beklenen davranıştı.
              </>
            ) : (
              <>
                Bu aslında <strong>meşru bir e-postaydı</strong>. Raporlamak veya
                silmek gerekmiyordu; ancak dikkatli olmak iyi bir alışkanlıktır.
              </>
            )}
          </span>
        </div>

        {/* E-postanın analizi */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, marginBottom: 16 }}>
            {isPhishing ? "Neden phishing?" : "Neden meşru?"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "6px 16px",
              fontSize: 13,
              marginBottom: isPhishing ? 20 : 0,
            }}
          >
            {[
              ["Gönderen", content.sender_name],
              ["Adres", content.sender_email],
              ["Konu", content.subject],
              [
                "Tür",
                <span className={`tag ${isPhishing ? "tag-danger" : "tag-success"}`}>
                  {isPhishing ? "Phishing" : "Meşru"} / {content.category}
                </span>,
              ],
            ].map(([label, value]) => (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--gray-50)",
                    paddingTop: 2,
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
                <span style={{ color: "var(--gray-100)" }}>{value}</span>
              </>
            ))}
          </div>

          {isPhishing && content.warning_signs.length > 0 && (
            <div style={{ borderTop: "1px solid var(--gray-20)", paddingTop: 16 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--red-60)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Uyarı isaretleri
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {content.warning_signs.map((sign, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--gray-70)" }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--red-60)",
                        paddingTop: 3,
                        flexShrink: 0,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isPhishing && (
            <div style={{ borderTop: "1px solid var(--gray-20)", paddingTop: 16 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--green-50)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Meşruluk göstergeleri
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Gönderen adresi tanınan, resmi bir domain kullanıyor",
                  "Kişisel bilgi veya kimlik doğrulaması talep edilmiyor",
                  "Gereksiz aciliyet veya tehdit içermiyor",
                  "Bağlantı beklenen bir servise yönlendiriyor",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--gray-70)" }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--green-50)",
                        paddingTop: 3,
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phishing tanıma rehberi */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, marginBottom: 20 }}>Phishing'i nasıl anlarsınız?</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "0",
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
                    padding: "16px",
                    borderRight: isRight ? "none" : "1px solid var(--gray-20)",
                    borderBottom: isLastRow ? "none" : "1px solid var(--gray-20)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--blue-60)",
                      letterSpacing: "0.04em",
                      marginBottom: 6,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-70)", lineHeight: 1.6 }}>
                    {tip.desc}
                  </div>
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
  {
    title: "Gönderen adresini doğrulayın",
    desc: "Gönderen adını değil, e-posta adresini kontrol edin. Resmi kurumlar kendi domain'lerini kullanır.",
  },
  {
    title: "Aciliyet baskısına dikkat",
    desc: "'Hemen yapın', '24 saat içinde' gibi ifadeler phishing'in klasik göstergesidir.",
  },
  {
    title: "Bağlantıları tıklamadan inceleyin",
    desc: "Fare imlecini linkin üzerine getirin. URL'nin beklediğiniz siteye gittiğini doğrulayın.",
  },
  {
    title: "Kişiselleştirme yoksa şüphelenin",
    desc: "Meşru kurumlar sizi adınızla selamlar. 'Sayın Müşterimiz' phishing işareti olabilir.",
  },
  {
    title: "Kimlik bilgisi taleplerini reddedin",
    desc: "Hiçbir meşru kurum e-posta yoluyla şifrenizi veya ödeme bilginizi istemez.",
  },
  {
    title: "Şüphelenince raporlayın",
    desc: "Emin değilseniz güvenlik ekibinize veya BT departmanına bildirin. Tıklamayın.",
  },
];
