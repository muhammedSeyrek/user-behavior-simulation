import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsApi, DashboardStats } from "../api/client";

const IBM_COLORS = ["#0f62fe", "#198038", "#da1e28", "#8a3ffc", "#0072c3", "#005d5d"];
const STORAGE_KEY = "phishsim_researcher_auth";

function getStoredAuth(): { username: string; password: string } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Auth Kapısı ───────────────────────────────────────────────────────────────

function AuthGate({ onAuth }: { onAuth: (u: string, p: string) => void }) {
  const [username, setUsername] = useState("researcher");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await analyticsApi.verifyCredentials(username, password);
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
        onAuth(username, password);
      } else if (res.status === 401) {
        setError("Kullanıcı adı veya şifre hatalı.");
      } else {
        setError(`Sunucu hatası (${res.status}). Backend rebuild gerekebilir: docker-compose up --build -d`);
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400 }}>
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
            Araştırmacı Girişi
          </p>
          <h1 style={{ fontSize: 20 }}>Dashboard</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="form-label">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="form-label">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--gray-50)",
                    borderBottom: "1px solid var(--gray-100)",
                    borderRadius: "3px",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <div className="notification notif-danger" style={{ marginBottom: 0 }}>
                  <span className="notification-label">Hata</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ justifyContent: "center", padding: "12px 16px" }}
                disabled={loading || !password}
              >
                {loading ? "Doğrulanıyor..." : "Giriş"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Export yardımcısı ─────────────────────────────────────────────────────────

async function triggerDownload(
  fetchFn: () => Promise<Response>,
  fallbackName: string
) {
  const res = await fetchFn();
  if (!res.ok) throw new Error("İndirme başarısız.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename=([^;]+)/);
  a.download = match ? match[1] : fallbackName;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Ana Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(
    getStoredAuth
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [exportLoading, setExportLoading] = useState<"csv" | "excel" | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await analyticsApi.getDashboard();
      setStats(data);
      setLastRefresh(new Date());
    } catch {
      setError("Veri yüklenemedi. Backend çalışıyor mu?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth) load();
  }, [auth]);

  async function handleExport(type: "csv" | "excel") {
    if (!auth) return;
    setExportLoading(type);
    try {
      if (type === "csv") {
        await triggerDownload(
          () => analyticsApi.exportCsv(auth.username, auth.password),
          "phishsim_export.csv"
        );
      } else {
        await triggerDownload(
          () => analyticsApi.exportExcel(auth.username, auth.password),
          "phishsim_export.xlsx"
        );
      }
    } catch {
      setError("Dışa aktarım başarısız.");
    } finally {
      setExportLoading(null);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuth(null);
    setStats(null);
  }

  if (!auth) {
    return <AuthGate onAuth={(u, p) => setAuth({ username: u, password: p })} />;
  }

  if (loading && !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--gray-50)" }}>
        Yükleniyor...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 500 }}>
          <div className="notification notif-danger" style={{ marginBottom: 16 }}>
            <span className="notification-label">Hata</span>
            <span>{error}</span>
          </div>
          <button className="btn-primary" onClick={load}>Tekrar Dene</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const noData = stats.total_participants === 0;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Başlık */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--gray-50)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Araştırmacı Paneli — {auth.username}
            </p>
            <h1 style={{ fontSize: 20 }}>Dashboard</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--gray-50)",
                marginRight: 4,
              }}
            >
              {lastRefresh.toLocaleTimeString("tr-TR")}
            </span>
            <button
              className="btn-outline"
              onClick={load}
              disabled={loading}
              style={{ fontSize: 13 }}
            >
              {loading ? "..." : "Yenile"}
            </button>
            <button
              className="btn-outline"
              onClick={() => handleExport("csv")}
              disabled={exportLoading !== null || noData}
              style={{ fontSize: 13 }}
            >
              {exportLoading === "csv" ? "..." : "CSV"}
            </button>
            <button
              className="btn-outline"
              onClick={() => handleExport("excel")}
              disabled={exportLoading !== null || noData}
              style={{ fontSize: 13 }}
            >
              {exportLoading === "excel" ? "..." : "Excel"}
            </button>
            <button
              className="btn-outline"
              onClick={handleLogout}
              style={{ fontSize: 13, color: "var(--gray-70)" }}
            >
              Çıkış
            </button>
          </div>
        </div>

        {error && (
          <div className="notification notif-danger" style={{ marginBottom: 20 }}>
            <span className="notification-label">Hata</span>
            <span>{error}</span>
          </div>
        )}

        {noData && (
          <div className="notification notif-info" style={{ marginBottom: 24 }}>
            <span className="notification-label">Bilgi</span>
            <span>
              Henüz veri yok. Ana sayfadan bir simülasyon tamamlayarak başlayabilirsiniz.
            </span>
          </div>
        )}

        {/* Özet istatistikler */}
        <div className="stat-grid">
          <StatCard value={stats.total_participants} label="Katılımcı" />
          <StatCard value={stats.total_sessions} label="Simülasyon" />
          <StatCard value={stats.total_interactions} label="Etkileşim" />
          <StatCard
            value={`%${stats.phishing_click_rate}`}
            label="Phishing Tıklama Oranı"
            variant={stats.phishing_click_rate > 40 ? "danger" : undefined}
          />
          <StatCard
            value={`%${stats.correct_decision_rate}`}
            label="Doğru Karar Oranı"
            variant={stats.correct_decision_rate > 60 ? "success" : undefined}
          />
          <StatCard
            value={
              stats.avg_time_to_action_ms
                ? `${(stats.avg_time_to_action_ms / 1000).toFixed(1)}s`
                : "—"
            }
            label="Ort. Karar Süresi"
          />
        </div>

        {/* Şifre Analizi */}
        {stats.password_tests > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={chartTitle}>Şifre Analizi</h3>
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              <StatCard value={stats.password_tests} label="Toplam Test" />
              <StatCard value={`${stats.avg_password_length} kr.`} label="Ort. Uzunluk" />
              <StatCard
                value={`${stats.avg_password_score} / 100`}
                label="Ort. Puan"
                variant={stats.avg_password_score >= 75 ? "success" : stats.avg_password_score < 50 ? "danger" : undefined}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--gray-60)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
              Karakter Türü Kullanım Oranları
            </p>
            {[
              { label: "Büyük harf (A-Z)", pct: stats.pct_has_upper },
              { label: "Küçük harf (a-z)", pct: stats.pct_has_lower },
              { label: "Rakam (0-9)", pct: stats.pct_has_digit },
              { label: "Özel karakter (!@#…)", pct: stats.pct_has_special },
            ].map(({ label, pct }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 160, fontSize: 12, color: "var(--gray-70)", flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--gray-20)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--blue-60)", borderRadius: 4, transition: "width 0.3s ease" }} />
                </div>
                <span style={{ width: 40, fontSize: 12, color: "var(--gray-70)", textAlign: "right", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  %{pct}
                </span>
              </div>
            ))}
          </div>
        )}

        {!noData && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div className="card">
                <h3 style={chartTitle}>Bölüm / Alan Dağılımı</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.by_department} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-20)" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                    <Bar dataKey="sessions" fill="#0f62fe" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 style={chartTitle}>Yaş Grubu Dağılımı</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.by_age_group}
                      dataKey="sessions"
                      nameKey="age_group"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ age_group, percent }) =>
                        `${age_group} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {stats.by_age_group.map((_, i) => (
                        <Cell key={i} fill={IBM_COLORS[i % IBM_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} oturum`]} contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {stats.by_it_experience.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={chartTitle}>BT Deneyimine Göre Etkileşim</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.by_it_experience}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-20)" />
                    <XAxis dataKey="it_experience" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                    <Bar dataKey="total" fill="#8a3ffc" radius={0} name="Etkileşim" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.recent_interactions.length > 0 && (
              <div className="card">
                <h3 style={chartTitle}>Son Etkileşimler</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                    <thead>
                      <tr style={{ background: "var(--gray-10)" }}>
                        {["İçerik Türü", "Kategori", "Eylem", "Karar", "Süre"].map((h) => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--gray-70)", borderBottom: "1px solid var(--gray-20)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_interactions.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--gray-10)" }}>
                          <td style={{ padding: "8px 12px" }}>
                            <span className={`tag ${row.content_type === "phishing" ? "tag-danger" : "tag-success"}`}>
                              {row.content_type === "phishing" ? "phishing" : "meşru"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--gray-70)" }}>{row.category}</td>
                          <td style={{ padding: "8px 12px", color: "var(--gray-100)" }}>{ACTION_LABELS[row.action] ?? row.action}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{ color: row.correct ? "var(--green-50)" : "var(--red-60)", fontWeight: 600 }}>
                              {row.correct ? "✓" : "✗"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--gray-70)" }}>
                            {row.time_ms ? `${(row.time_ms / 1000).toFixed(1)}s` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const chartTitle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--gray-70)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 16,
};

const ACTION_LABELS: Record<string, string> = {
  clicked_link: "tıkladı",
  reported_phishing: "raporladı",
  ignored: "sildi",
  submitted_form: "form doldurdu",
};

function StatCard({ value, label, variant }: { value: string | number; label: string; variant?: "danger" | "success" }) {
  return (
    <div className="stat-card">
      <div className={`value${variant ? " " + variant : ""}`}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
