import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { interactionApi, sessionApi, SimulationContent } from "../api/client";

type Action = "clicked_link" | "reported_phishing" | "ignored";

export default function SimulationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session_id = (location.state as { session_id?: string })?.session_id;

  const [content, setContent] = useState<SimulationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!session_id) {
      navigate("/");
      return;
    }
    sessionApi
      .getContent(session_id)
      .then((res) => {
        setContent(res.content);
        startTimeRef.current = Date.now();
      })
      .catch(() => setError("İçerik yüklenemedi."))
      .finally(() => setLoading(false));
  }, [session_id, navigate]);

  async function handleAction(action: Action) {
    if (actionTaken || !session_id) return;
    setActionTaken(true);
    const elapsed = Date.now() - startTimeRef.current;
    await interactionApi.log({ session_id, action, time_to_action_ms: elapsed });
    navigate("/awareness", { state: { action, content } });
  }

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
      <div className="container" style={{ maxWidth: 680 }}>
        {/* Simülasyon bandı */}
        <div className="notification notif-warning" style={{ marginBottom: 24 }}>
          <span className="notification-label">Simülasyon</span>
          <span>
            Aşağıdaki e-posta bir araştırma simülasyonudur. Gerçek değildir.
          </span>
        </div>

        {/* E-posta kutusu */}
        <div className="card" style={{ marginBottom: 16 }}>
          {/* Başlık */}
          <div
            style={{
              borderBottom: "1px solid var(--gray-20)",
              paddingBottom: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--gray-90)",
                  color: "var(--gray-10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {content.sender_name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{content.sender_name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--gray-50)",
                    }}
                  >
                    az önce
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--gray-70)",
                  }}
                >
                  {content.sender_email}
                </div>
              </div>
            </div>

            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "var(--gray-100)",
                marginTop: 14,
              }}
            >
              {content.subject}
            </div>
          </div>

          {/* Gövde */}
          <div
            style={{
              fontSize: 14,
              color: "var(--gray-70)",
              lineHeight: 1.75,
              whiteSpace: "pre-line",
              marginBottom: 24,
            }}
          >
            {content.body}
          </div>

          {/* Link alanı */}
          <div
            style={{
              background: "var(--gray-10)",
              border: "1px solid var(--gray-20)",
              padding: 16,
            }}
          >
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px 16px" }}
              disabled={actionTaken}
              onClick={() => handleAction("clicked_link")}
            >
              {content.link_text}
            </button>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--gray-50)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {content.link_url === "#simulation-click"
                ? "https://..."
                : content.link_url}
            </div>
          </div>
        </div>

        {/* Karar paneli */}
        <div className="card">
          <p
            style={{
              fontSize: 13,
              color: "var(--gray-70)",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            Bu e-postayı nasıl değerlendiriyorsunuz?
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-danger"
              style={{ flex: 1, minWidth: 180, justifyContent: "center" }}
              disabled={actionTaken}
              onClick={() => handleAction("reported_phishing")}
            >
              Phishing Olarak Raporla
            </button>
            <button
              className="btn-outline"
              style={{ flex: 1, minWidth: 180, justifyContent: "center" }}
              disabled={actionTaken}
              onClick={() => handleAction("ignored")}
            >
              Sil / Görmezden Gel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
