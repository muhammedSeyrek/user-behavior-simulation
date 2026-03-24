import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RoundResult, surveyApi } from "../api/client";

interface LocationState {
  rounds: RoundResult[];
  participant_id: string;
}

// ── Soru tanımları ────────────────────────────────────────────────────────────
const RADIO_QUESTIONS = [
  {
    key: "daily_email_count",
    label: "Günlük ortalama kaç iş e-postası alıyorsunuz?",
    options: ["10'dan az", "10–50", "50–100", "100+"],
  },
  {
    key: "click_behavior",
    label: "E-postalardaki bağlantılara genellikle ne yaparsınız?",
    options: [
      "Hemen tıklarım",
      "Önce incelerim, sonra tıklarım",
      "Nadiren tıklarım",
      "Hiçbir zaman tıklamam",
    ],
  },
  {
    key: "primary_device",
    label: "İş e-postalarını en sık hangi cihazdan okursunuz?",
    options: ["Masaüstü / Laptop", "Akıllı telefon", "Tablet", "Karma"],
  },
  {
    key: "prior_security_training",
    label: "Daha önce phishing / siber güvenlik eğitimi aldınız mı?",
    options: [
      "Hiç almadım",
      "1–2 yıl önce aldım",
      "Son 1 yılda aldım",
      "Düzenli olarak alıyorum",
    ],
  },
  {
    key: "workplace_policy",
    label: "Kurumunuzda phishing / e-posta güvenlik politikası var mı?",
    options: ["Evet, biliyorum", "Var ama ayrıntısını bilmiyorum", "Yok", "Bilmiyorum"],
  },
];

const MULTI_QUESTION = {
  key: "security_tools",
  label: "Hangi güvenlik araçlarını kullanıyorsunuz? (birden fazla seçebilirsiniz)",
  options: [
    "Antivirüs / güvenlik yazılımı",
    "VPN",
    "Şifre yöneticisi",
    "İki faktörlü kimlik doğrulama (2FA)",
    "Hiçbirini kullanmıyorum",
  ],
};

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────
function RadioGroup({
  qkey,
  label,
  options,
  value,
  onChange,
}: {
  qkey: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              border: `1px solid ${value === opt ? "var(--blue-60)" : "var(--gray-20)"}`,
              background: value === opt ? "var(--blue-10)" : "transparent",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--gray-80)",
            }}
          >
            <input
              type="radio"
              name={qkey}
              checked={value === opt}
              onChange={() => onChange(opt)}
              style={{ accentColor: "var(--blue-60)" }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────
export default function SurveyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state) { navigate("/"); return null; }
  const { rounds, participant_id } = state;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setAnswer = (key: string, val: string) =>
    setAnswers((prev) => ({ ...prev, [key]: val }));

  const toggleMulti = (opt: string) =>
    setMultiAnswers((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );

  const allRadiosFilled = RADIO_QUESTIONS.every((q) => answers[q.key]);
  const canSubmit = allRadiosFilled && multiAnswers.length > 0 && !loading;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await surveyApi.submit(participant_id, {
        ...answers,
        [MULTI_QUESTION.key]: multiAnswers,
      });
      navigate("/awareness", { state: { rounds } });
    } catch {
      setError("Anket kaydedilemedi. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 620 }}>
        {/* Başlık */}
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
            Simülasyon tamamlandı — {rounds.length} e-posta değerlendirildi
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-100)", marginBottom: 8 }}>
            Kısa Anket
          </h2>
          <p style={{ fontSize: 14, color: "var(--gray-60)", lineHeight: 1.6 }}>
            Araştırmamızın son adımı olarak web alışkanlıklarınız ve güvenlik
            farkındalığınız hakkında birkaç soru sormak istiyoruz. Cevaplar
            anonim ve yalnızca araştırma amacıyla kullanılacaktır.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--gray-50)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Web Alışkanlıkları
          </p>

          {RADIO_QUESTIONS.slice(0, 3).map((q) => (
            <RadioGroup
              key={q.key}
              qkey={q.key}
              label={q.label}
              options={q.options}
              value={answers[q.key] ?? ""}
              onChange={(v) => setAnswer(q.key, v)}
            />
          ))}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--gray-50)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Güvenlik Farkındalığı
          </p>

          {RADIO_QUESTIONS.slice(3).map((q) => (
            <RadioGroup
              key={q.key}
              qkey={q.key}
              label={q.label}
              options={q.options}
              value={answers[q.key] ?? ""}
              onChange={(v) => setAnswer(q.key, v)}
            />
          ))}

          {/* Çoklu seçim — güvenlik araçları */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
              {MULTI_QUESTION.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MULTI_QUESTION.options.map((opt) => {
                const selected = multiAnswers.includes(opt);
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
                      onChange={() => toggleMulti(opt)}
                      style={{ accentColor: "var(--blue-60)" }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="notification notif-danger" style={{ marginBottom: 12 }}>
            <span className="notification-label">Hata</span>
            <span>{error}</span>
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "14px" }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {loading ? "Kaydediliyor..." : "Anketi Tamamla →"}
        </button>
      </div>
    </div>
  );
}
