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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function load() {
    setLoading(true);
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
    load();
  }, []);

  if (loading && !stats) {
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
          <div className="notification notif-danger" style={{ marginBottom: 16 }}>
            <span className="notification-label">Hata</span>
            <span>{error}</span>
          </div>
          <button className="btn-primary" onClick={load}>
            Tekrar Dene
          </button>
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
              Araştırmacı Paneli
            </p>
            <h1 style={{ fontSize: 20 }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--gray-50)",
              }}
            >
              {lastRefresh.toLocaleTimeString("tr-TR")}
            </span>
            <button className="btn-outline" onClick={load} disabled={loading}>
              {loading ? "..." : "Yenile"}
            </button>
          </div>
        </div>

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

        {!noData && (
          <>
            {/* Grafik satırı */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div className="card">
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--gray-70)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Bölüm / Alan Dağılımı
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.by_department} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-20)" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <YAxis
                      dataKey="department"
                      type="category"
                      width={110}
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                    />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                    <Bar dataKey="sessions" fill="#0f62fe" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--gray-70)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Yaş Grubu Dağılımı
                </h3>
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
                    <Tooltip
                      formatter={(v) => [`${v} oturum`]}
                      contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BT Deneyimi */}
            {stats.by_it_experience.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--gray-70)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  BT Deneyimine Göre Etkileşim
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.by_it_experience}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-20)" />
                    <XAxis
                      dataKey="it_experience"
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                    />
                    <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                    <Bar dataKey="total" fill="#8a3ffc" radius={0} name="Etkileşim" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Son etkileşimler tablosu */}
            {stats.recent_interactions.length > 0 && (
              <div className="card">
                <h3
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--gray-70)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Son Etkileşimler
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "var(--gray-10)" }}>
                        {["İçerik Türü", "Kategori", "Eylem", "Karar", "Süre"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 12px",
                              textAlign: "left",
                              fontWeight: 500,
                              fontSize: 11,
                              color: "var(--gray-70)",
                              borderBottom: "1px solid var(--gray-20)",
                              letterSpacing: "0.02em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_interactions.map((row, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid var(--gray-10)",
                          }}
                        >
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              className={`tag ${
                                row.content_type === "phishing"
                                  ? "tag-danger"
                                  : "tag-success"
                              }`}
                            >
                              {row.content_type === "phishing" ? "phishing" : "meşru"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--gray-70)" }}>
                            {row.category}
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--gray-100)" }}>
                            {ACTION_LABELS[row.action] ?? row.action}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                color: row.correct ? "var(--green-50)" : "var(--red-60)",
                                fontWeight: 600,
                              }}
                            >
                              {row.correct ? "✓" : "✗"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              color: "var(--gray-70)",
                            }}
                          >
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

const ACTION_LABELS: Record<string, string> = {
  clicked_link: "tıkladı",
  reported_phishing: "raporladı",
  ignored: "sildi",
  submitted_form: "form doldurdu",
};

function StatCard({
  value,
  label,
  variant,
}: {
  value: string | number;
  label: string;
  variant?: "danger" | "success";
}) {
  return (
    <div className="stat-card">
      <div className={`value${variant ? " " + variant : ""}`}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
