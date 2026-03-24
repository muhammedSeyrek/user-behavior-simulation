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
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Sonuç kartı */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            borderLeft: `4px solid ${wasCorrect ? "var(--success)" : "var(--danger)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>{wasCorrect ? "✅" : "⚠️"}</span>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {wasCorrect ? "Doğru Karar!" : "Dikkat!"}
              </h2>
              <p style={{ color: "var(--gray-600)", fontSize: 14 }}>
                Kararınız:{" "}
                <strong>{ACTION_LABELS[action]}</strong>
              </p>
            </div>
          </div>

          <div
            className={`alert ${wasCorrect ? "alert-success" : "alert-danger"}`}
            style={{ marginBottom: 0 }}
          >
            {isPhishing ? (
              wasCorrect ? (
                action === "reported_phishing" ? (
                  <>
                    Harika! Bu bir <strong>phishing e-postasıydı</strong> ve siz
                    doğru şekilde raporladınız. Bu davranış organizasyonunuzu ve
                    kendinizi korur.
                  </>
                ) : (
                  <>
                    İyi! Bu bir <strong>phishing e-postasıydı</strong> ve siz
                    görmezden geldiniz. Ancak raporlamak daha iyi olurdu — bu
                    sayede güvenlik ekibi uyarılabilirdi.
                  </>
                )
              ) : (
                <>
                  Bu bir <strong>phishing (oltalama) e-postasıydı!</strong>{" "}
                  Bağlantıya tıklamak gerçek bir senaryoda kimlik bilgilerinizin
                  çalınmasına yol açabilirdi.
                </>
              )
            ) : wasCorrect ? (
              <>
                Bu meşru bir e-postaydı ve siz doğru şekilde bağlantıya
                tıkladınız. Gerçek bir senaryoda bu beklenen davranış olurdu.
              </>
            ) : (
              <>
                Bu aslında <strong>meşru bir e-postaydı.</strong> Raporlamak
                veya silmek gereksizdi. Ancak dikkatli olmak iyi bir alışkanlıktır.
              </>
            )}
          </div>
        </div>

        {/* E-postanın gerçek kimliği */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>
            {isPhishing ? "🎣 Bu Neden Phishing?" : "✉️ Bu Neden Meşru?"}
          </h3>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 8 }}>
              <strong>Gönderen:</strong> {content.sender_name} (
              {content.sender_email})
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 8 }}>
              <strong>Konu:</strong> {content.subject}
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-600)" }}>
              <strong>Kategori:</strong>{" "}
              <span className={`badge ${isPhishing ? "badge-danger" : "badge-success"}`}>
                {isPhishing ? "Phishing" : "Meşru"}
              </span>{" "}
              · {content.category}
            </p>
          </div>

          {isPhishing && content.warning_signs.length > 0 && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: "var(--danger)" }}>
                🚩 Uyarı İşaretleri:
              </h4>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {content.warning_signs.map((sign, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 14,
                      color: "var(--gray-700)",
                      lineHeight: 1.5,
                    }}
                  >
                    {sign}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!isPhishing && (
            <>
              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: "var(--success)" }}>
                ✅ Meşruluğun İşaretleri:
              </h4>
              <ul
                style={{
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 14,
                  color: "var(--gray-700)",
                }}
              >
                <li>Gönderen adresi tanınan, resmi bir domain kullanıyor</li>
                <li>İçerik kişisel bilgi veya kimlik doğrulaması talep etmiyor</li>
                <li>Gereksiz aciliyet veya tehdit içermiyor</li>
                <li>Bağlantı beklenen bir servise yönlendiriyor</li>
              </ul>
            </>
          )}
        </div>

        {/* Genel phishing ipuçları */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
            📚 Phishing'i Nasıl Anlarsınız?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {TIPS.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius)",
                  padding: 14,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {tip.icon} {tip.title}
                </div>
                <div style={{ color: "var(--gray-600)" }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn-primary"
            style={{ padding: "12px 40px", fontSize: 15 }}
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
    icon: "📧",
    title: "Gönderen Adresi",
    desc: "Gönderen adını değil, e-posta adresini kontrol edin. Resmi kurumlar kendi domain'lerini kullanır.",
  },
  {
    icon: "⚡",
    title: "Aciliyet Baskısı",
    desc: "'Hemen yapın', '24 saat içinde' gibi ifadeler phishing'in klasik belirtisidir.",
  },
  {
    icon: "🔗",
    title: "Bağlantıları Kontrol Edin",
    desc: "Tıklamadan önce linkin üzerine gelin. URL'nin beklediğiniz siteye gittiğini doğrulayın.",
  },
  {
    icon: "🙋",
    title: "Kişiselleştirme",
    desc: "Meşru kurumlar sizi adınızla selamlar. 'Sayın Müşterimiz' phishing işareti olabilir.",
  },
  {
    icon: "🔑",
    title: "Kimlik Bilgisi Talebi",
    desc: "Hiçbir meşru kurum e-posta yoluyla şifrenizi veya kredi kartı bilginizi istemez.",
  },
  {
    icon: "🚨",
    title: "Şüphelenince Raporlayın",
    desc: "Emin değilseniz e-postayı BT/güvenlik ekibinize raporlayın. Tıklamayın.",
  },
];
