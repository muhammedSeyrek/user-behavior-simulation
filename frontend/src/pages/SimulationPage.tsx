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
    await interactionApi.log({
      session_id,
      action,
      time_to_action_ms: elapsed,
    });
    navigate("/awareness", { state: { action, content } });
  }

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!content) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Simülasyon uyarısı */}
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <strong>⚠️ Simülasyon:</strong> Aşağıdaki e-posta bir araştırma
          simülasyonudur. Gerçek değildir.
        </div>

        {/* E-posta içeriği */}
        <div className="card" style={{ marginBottom: 20 }}>
          {/* E-posta başlığı */}
          <div
            style={{
              borderBottom: "1px solid var(--gray-200)",
              paddingBottom: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {content.sender_name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {content.sender_name}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
                    az önce
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--gray-600)",
                    fontFamily: "monospace",
                  }}
                >
                  {content.sender_email}
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: 17, color: "var(--gray-900)" }}>
              {content.subject}
            </div>
          </div>

          {/* E-posta gövdesi */}
          <div
            style={{
              fontSize: 14,
              color: "var(--gray-700)",
              lineHeight: 1.8,
              whiteSpace: "pre-line",
              marginBottom: 20,
            }}
          >
            {content.body}
          </div>

          {/* Link butonu */}
          <div
            style={{
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius)",
              padding: 16,
              textAlign: "center",
            }}
          >
            <button
              className="btn-primary"
              style={{ padding: "12px 32px", fontSize: 15 }}
              disabled={actionTaken}
              onClick={() => handleAction("clicked_link")}
            >
              🔗 {content.link_text}
            </button>
            <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 8 }}>
              {content.link_url === "#simulation-click"
                ? "Şüpheli bağlantı"
                : content.link_url}
            </div>
          </div>
        </div>

        {/* Karar butonları */}
        <div className="card">
          <p
            style={{
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--gray-700)",
            }}
          >
            Bu e-postayı nasıl değerlendiriyorsunuz?
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn-danger"
              style={{ flex: 1, minWidth: 180 }}
              disabled={actionTaken}
              onClick={() => handleAction("reported_phishing")}
            >
              🚨 Phishing Olarak Raporla
            </button>
            <button
              className="btn-outline"
              style={{ flex: 1, minWidth: 180 }}
              disabled={actionTaken}
              onClick={() => handleAction("ignored")}
            >
              🗑️ Sil / Görmezden Gel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        color: "var(--gray-600)",
      }}
    >
      E-posta yükleniyor...
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500, textAlign: "center" }}>
        <div className="alert alert-danger">{message}</div>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
