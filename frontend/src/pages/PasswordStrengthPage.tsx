import { useState } from "react";

interface Criteria {
  label: string;
  met: boolean;
}

function scorePassword(pwd: string): { score: number; criteria: Criteria[] } {
  const hasMinLength = pwd.length >= 8;
  const hasGoodLength = pwd.length >= 12;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const score =
    (hasMinLength ? 20 : 0) +
    (hasGoodLength ? 10 : 0) +
    (hasUpper ? 15 : 0) +
    (hasLower ? 15 : 0) +
    (hasDigit ? 20 : 0) +
    (hasSpecial ? 20 : 0);

  const criteria: Criteria[] = [
    { label: "En az 8 karakter", met: hasMinLength },
    { label: "En az 12 karakter", met: hasGoodLength },
    { label: "Büyük harf içeriyor (A-Z)", met: hasUpper },
    { label: "Küçük harf içeriyor (a-z)", met: hasLower },
    { label: "Rakam içeriyor (0-9)", met: hasDigit },
    { label: "Özel karakter içeriyor (!@#$%^&*…)", met: hasSpecial },
  ];

  return { score, criteria };
}

function getStrengthInfo(score: number): { label: string; color: string } {
  if (score < 25) return { label: "Çok Zayıf", color: "var(--red-60)" };
  if (score < 50) return { label: "Zayıf", color: "#e67e22" };
  if (score < 75) return { label: "Orta", color: "var(--yellow-30)" };
  if (score < 90) return { label: "Güçlü", color: "#27ae60" };
  return { label: "Çok Güçlü", color: "var(--green-50)" };
}

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const { score, criteria } = scorePassword(password);
  const { label, color } = getStrengthInfo(score);
  const hasInput = password.length > 0;

  const missing = criteria.filter((c) => !c.met).map((c) => c.label);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Şifre Gücü Testi
        </h1>
        <p style={{ color: "var(--gray-70)", marginBottom: 28, fontSize: 14 }}>
          Şifrenizi girin, ne kadar güçlü olduğunu anlık olarak görebilin.
          Gerçek şifrenizi buraya yazmak zorunda değilsiniz — benzer bir şifre
          ile test edebilirsiniz.
        </p>

        {/* Giriş alanı */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi buraya girin…"
            autoComplete="off"
            style={{
              flex: 1,
              padding: "10px 12px",
              fontSize: 15,
              border: "1px solid var(--gray-30)",
              borderRadius: 4,
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: visible ? "normal" : "0.1em",
              outline: "none",
              background: "var(--gray-10)",
              color: "var(--gray-100)",
            }}
          />
          <button
            className="btn-outline"
            onClick={() => setVisible((v) => !v)}
            title={visible ? "Gizle" : "Göster"}
            style={{ padding: "10px 14px", flexShrink: 0 }}
          >
            {visible ? "🙈" : "👁"}
          </button>
        </div>

        {/* Güç çubuğu */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              height: 10,
              borderRadius: 6,
              background: "var(--gray-20)",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                height: "100%",
                width: hasInput ? `${score}%` : "0%",
                background: hasInput ? color : "transparent",
                borderRadius: 6,
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: hasInput ? color : "var(--gray-40)",
              }}
            >
              {hasInput ? label : "—"}
            </span>
            <span style={{ color: "var(--gray-60)" }}>
              {hasInput ? `${score} / 100 puan` : ""}
            </span>
          </div>
        </div>

        {/* Kriter checklistesi */}
        <div className="card" style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--gray-60)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Kriterler
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {criteria.map((c) => (
              <div
                key={c.label}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    fontSize: 16,
                    color:
                      !hasInput
                        ? "var(--gray-40)"
                        : c.met
                        ? "var(--green-50)"
                        : "var(--red-60)",
                    lineHeight: 1,
                  }}
                >
                  {!hasInput ? "○" : c.met ? "✓" : "✗"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: !hasInput
                      ? "var(--gray-50)"
                      : c.met
                      ? "var(--gray-80)"
                      : "var(--gray-60)",
                  }}
                >
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tavsiye mesajı */}
        {hasInput && missing.length > 0 && (
          <div className="notification notif-info" style={{ fontSize: 13 }}>
            <strong>Şifrenizi güçlendirmek için:</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {hasInput && missing.length === 0 && (
          <div className="notification notif-success" style={{ fontSize: 13 }}>
            Tüm kriterleri karşılıyor — bu şifre çok güçlü!
          </div>
        )}
      </div>
    </div>
  );
}
