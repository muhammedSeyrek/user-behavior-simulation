import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { participantApi, sessionApi } from "../api/client";

const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"];
const EDUCATIONS = ["Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];
const IT_LEVELS = [
  { value: "yok", label: "Yok — Temel bilgisayar kullanımı" },
  { value: "az", label: "Az — E-posta ve ofis programları" },
  { value: "orta", label: "Orta — Belirli teknik bilgim var" },
  { value: "çok", label: "Çok — BT/yazılım alanında çalışıyorum" },
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
      const participant = await participantApi.create({
        ...form,
        consent_given: true,
      });
      const session = await sessionApi.create(participant.id);
      navigate("/simulation", { state: { session_id: session.id } });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Bir hata oluştu, lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        {step === "intro" && (
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                Phishing Farkındalık Simülasyonu
              </h1>
              <p style={{ color: "var(--gray-600)", fontSize: 15 }}>
                Siber güvenlik farkındalığı araştırma projesi
              </p>
            </div>

            <div className="alert alert-info">
              Bu bir <strong>akademik araştırma</strong> simülasyonudur. Gerçek
              bir saldırı değildir. Tüm veriler anonim olarak işlenir.
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Çalışma Hakkında
            </h2>
            <p style={{ color: "var(--gray-600)", fontSize: 14, marginBottom: 16 }}>
              Bu çalışmada size bir e-posta gösterilecektir. E-postanın gerçek
              mi yoksa phishing (oltalama) mi olduğuna karar vermeniz
              istenecek. Kararınızı etkileyen faktörler anonim olarak
              kaydedilecek ve siber güvenlik farkındalığı araştırmasında
              kullanılacaktır.
            </p>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Ne Bekleniyor?
            </h2>
            <ul
              style={{
                color: "var(--gray-600)",
                fontSize: 14,
                paddingLeft: 20,
                marginBottom: 24,
                lineHeight: 2,
              }}
            >
              <li>Kısa demografik anket (1 dakika)</li>
              <li>Bir simülasyon e-postası değerlendirme (2-3 dakika)</li>
              <li>Geri bildirim ve eğitim içeriği</li>
            </ul>

            <button
              className="btn-primary"
              style={{ width: "100%", padding: 14, fontSize: 16 }}
              onClick={() => setStep("form")}
            >
              Başla →
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Demografik Bilgiler
            </h2>
            <p
              style={{
                color: "var(--gray-600)",
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              Bilgileriniz tamamen anonimdir ve yalnızca araştırma amaçlı
              kullanılır.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label>Yaş Grubu</label>
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
                <label>Eğitim Düzeyi</label>
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
                <label>Çalıştığınız / Okuduğunuz Bölüm / Alan</label>
                <input
                  type="text"
                  placeholder="ör. Bilgisayar Mühendisliği, Muhasebe, Sağlık..."
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                />
              </div>

              <div>
                <label>Bilişim Teknolojileri Deneyimi</label>
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
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="training" style={{ margin: 0 }}>
                  Daha önce siber güvenlik eğitimi aldım
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                className="btn-outline"
                onClick={() => setStep("intro")}
                style={{ flex: 1 }}
              >
                ← Geri
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                disabled={!formValid}
                onClick={() => setStep("consent")}
              >
                Devam →
              </button>
            </div>
          </div>
        )}

        {step === "consent" && (
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Bilgilendirilmiş Rıza Formu
            </h2>

            <div
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: "var(--radius)",
                padding: 16,
                fontSize: 13,
                color: "var(--gray-700)",
                lineHeight: 1.8,
                marginBottom: 20,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              <p>
                <strong>Araştırma Başlığı:</strong> Phishing Saldırılarına
                Karşı Kullanıcı Davranışı Analizi
              </p>
              <p style={{ marginTop: 8 }}>
                Bu araştırma kapsamında size bir simülasyon e-postası
                gösterilecek ve davranışınız kayıt altına alınacaktır.
                Toplanan veriler arasında:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li>Demografik bilgileriniz (yaş grubu, eğitim, bölüm)</li>
                <li>Simülasyona verdiğiniz karar (tıklama, raporlama vb.)</li>
                <li>Karar süreniz (milisaniye)</li>
                <li>Cihaz türünüz (mobil/masaüstü)</li>
              </ul>
              <p style={{ marginTop: 8 }}>
                <strong>Gizlilik:</strong> Tüm veriler anonimdir. Kişisel
                kimliğinizi tespit edecek hiçbir bilgi toplanmaz.
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>Gönüllülük:</strong> Katılım tamamen gönüllüdür. İstediğiniz
                zaman çıkabilirsiniz. Gerçek kimlik bilgileriniz hiçbir
                şekilde saklanmaz.
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>İletişim:</strong> Araştırma hakkında sorularınız için
                danışman hocanıza ulaşabilirsiniz.
              </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-outline"
                onClick={() => setStep("form")}
                style={{ flex: 1 }}
              >
                ← Geri
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
                onClick={handleStart}
              >
                {loading ? "Hazırlanıyor..." : "Onaylıyorum — Simülasyonu Başlat"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
