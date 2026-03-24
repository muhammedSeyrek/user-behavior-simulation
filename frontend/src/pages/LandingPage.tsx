import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { participantApi, sessionApi } from "../api/client";

const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"];
const EDUCATIONS = ["Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];
const IT_LEVELS = [
  { value: "yok", label: "Yok — Temel bilgisayar kullanımı" },
  { value: "az", label: "Az — E-posta ve ofis programları" },
  { value: "orta", label: "Orta — Belirli teknik bilgim var" },
  { value: "çok", label: "Çok — BT / yazılım alanında çalışıyorum" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "form" | "consent">("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age_group: "",
    education: "",
    department: "",
    it_experience: "",
    prior_training: false,
  });

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const formValid =
    form.age_group && form.education && form.department && form.it_experience;

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const participant = await participantApi.create({ ...form, consent_given: true });
      const session = await sessionApi.create(participant.id);
      navigate("/simulation", { state: { session_id: session.id } });
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        {step === "intro" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--gray-50)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Araştırma Platformu
              </p>
              <h1 style={{ fontSize: 24, marginBottom: 12 }}>
                Phishing Farkındalık Simülasyonu
              </h1>
              <p style={{ color: "var(--gray-70)", fontSize: 14 }}>
                Siber güvenlik davranışı araştırması — anonim, gönüllülük esaslı
              </p>
            </div>

            <div className="notification notif-info" style={{ marginBottom: 24 }}>
              <span className="notification-label">Bilgi</span>
              <span>
                Bu bir akademik simülasyondur. Gerçek bir saldırı değildir.
                Tüm veriler anonimdir.
              </span>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0",
                  border: "1px solid var(--gray-20)",
                }}
              >
                {[
                  ["01", "Demografik anket", "~1 dakika"],
                  ["02", "E-posta değerlendirme", "~2–3 dakika"],
                  ["03", "Geri bildirim ve eğitim", "~1 dakika"],
                  ["04", "Anonim veri kaydı", "Otomatik"],
                ].map(([num, title, desc]) => (
                  <div
                    key={num}
                    style={{
                      padding: "16px",
                      borderRight: num === "01" || num === "03" ? "1px solid var(--gray-20)" : "none",
                      borderBottom: num === "01" || num === "02" ? "1px solid var(--gray-20)" : "none",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--blue-60)",
                        marginBottom: 6,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {num}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-50)" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px 16px", fontSize: 14 }}
              onClick={() => setStep("form")}
            >
              Başla
            </button>
          </div>
        )}

        {step === "form" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--gray-50)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Adım 1 / 2
              </p>
              <h2 style={{ fontSize: 18 }}>Demografik Bilgiler</h2>
            </div>

            <div className="card">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label className="form-label">Yaş Grubu</label>
                  <select
                    value={form.age_group}
                    onChange={(e) => set("age_group", e.target.value)}
                  >
                    <option value="">Seçin...</option>
                    {AGE_GROUPS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Eğitim Düzeyi</label>
                  <select
                    value={form.education}
                    onChange={(e) => set("education", e.target.value)}
                  >
                    <option value="">Seçin...</option>
                    {EDUCATIONS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Bölüm / Çalışma Alanı</label>
                  <input
                    type="text"
                    placeholder="ör. Bilgisayar Mühendisliği, Muhasebe..."
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">BT Deneyimi</label>
                  <select
                    value={form.it_experience}
                    onChange={(e) => set("it_experience", e.target.value)}
                  >
                    <option value="">Seçin...</option>
                    {IT_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="training"
                    checked={form.prior_training}
                    onChange={(e) => set("prior_training", e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--blue-60)" }}
                  />
                  <label
                    htmlFor="training"
                    style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 14, fontWeight: 400, color: "var(--gray-100)" }}
                  >
                    Daha önce siber güvenlik eğitimi aldım
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
                <button className="btn-outline" onClick={() => setStep("intro")} style={{ flex: 1, justifyContent: "center" }}>
                  Geri
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  disabled={!formValid}
                  onClick={() => setStep("consent")}
                >
                  Devam
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "consent" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--gray-50)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Adım 2 / 2
              </p>
              <h2 style={{ fontSize: 18 }}>Bilgilendirilmiş Rıza</h2>
            </div>

            <div className="card">
              <div
                style={{
                  background: "var(--gray-10)",
                  border: "1px solid var(--gray-20)",
                  padding: 16,
                  fontSize: 13,
                  color: "var(--gray-70)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: "var(--gray-100)" }}>Araştırma Başlığı:</strong>{" "}
                  Phishing Saldırılarına Karşı Kullanıcı Davranışı Analizi
                </p>
                <p style={{ marginBottom: 8 }}>Bu araştırma kapsamında toplanan veriler:</p>
                <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
                  <li>Demografik bilgiler (yaş grubu, eğitim, bölüm)</li>
                  <li>Simülasyona verilen karar (tıklama, raporlama vb.)</li>
                  <li>Karar süresi (milisaniye)</li>
                  <li>Cihaz türü (mobil / masaüstü)</li>
                </ul>
                <p style={{ marginBottom: 8 }}>
                  <strong style={{ color: "var(--gray-100)" }}>Gizlilik:</strong>{" "}
                  Tüm veriler anonimdir. Kişisel kimliğinizi tespit edecek hiçbir bilgi toplanmaz.
                </p>
                <p>
                  <strong style={{ color: "var(--gray-100)" }}>Gönüllülük:</strong>{" "}
                  Katılım tamamen gönüllüdür. İstediğiniz zaman çıkabilirsiniz.
                </p>
              </div>

              {error && (
                <div className="notification notif-danger" style={{ marginBottom: 16 }}>
                  <span className="notification-label">Hata</span>
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-outline" onClick={() => setStep("form")} style={{ flex: 1, justifyContent: "center" }}>
                  Geri
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  disabled={loading}
                  onClick={handleStart}
                >
                  {loading ? "Hazırlanıyor..." : "Onaylıyorum — Başlat"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
