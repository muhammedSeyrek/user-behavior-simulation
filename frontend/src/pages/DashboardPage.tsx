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
  Legend,
} from "recharts";
import { analyticsApi, DashboardStats } from "../api/client";

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

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

  if (loading && !stats) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={load} />;
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
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Araştırmacı Dashboard</h1>
            <p style={{ color: "var(--gray-600)", fontSize: 13, marginTop: 2 }}>
              Son güncelleme: {lastRefresh.toLocaleTimeString("tr-TR")}
            </p>
          </div>
          <button className="btn-outline" onClick={load} disabled={loading}>
            {loading ? "Yükleniyor..." : "↻ Yenile"}
          </button>
        </div>

        {noData && (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            Henüz veri yok. Ana sayfadan bir simülasyon tamamlayarak başlayabilirsiniz.
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
            danger={stats.phishing_click_rate > 40}
          />
          <StatCard
            value={`%${stats.correct_decision_rate}`}
            label="Doğru Karar Oranı"
            success={stats.correct_decision_rate > 60}
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
            {/* Grafik satırı 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
                marginBottom: 20,
              }}
            >
              {/* Departmana göre */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                  Bölüm / Alan Dağılımı
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.by_department} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="department"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Yaş grubu */}
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                  Yaş Grubu Dağılımı
                </h3>
                <ResponsiveContainer width="100%" height={220}>
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
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} oturum`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BT Deneyimi */}
            {stats.by_it_experience.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                  BT Deneyimine Göre Etkileşim Sayısı
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.by_it_experience}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="it_experience" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Etkileşim" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Son etkileşimler */}
            {stats.recent_interactions.length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                  Son Etkileşimler
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--gray-50)" }}>
                        {["İçerik Türü", "Kategori", "Eylem", "Karar", "Süre"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "var(--gray-600)",
                              borderBottom: "1px solid var(--gray-200)",
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
                            borderBottom: "1px solid var(--gray-100)",
                            background: i % 2 === 0 ? "white" : "var(--gray-50)",
                          }}
                        >
                          <td style={{ padding: "9px 12px" }}>
                            <span
                              className={`badge ${
                                row.content_type === "phishing"
                                  ? "badge-danger"
                                  : "badge-success"
                              }`}
                            >
                              {row.content_type === "phishing" ? "Phishing" : "Meşru"}
                            </span>
                          </td>
                          <td style={{ padding: "9px 12px", color: "var(--gray-600)" }}>
                            {row.category}
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            {ACTION_LABELS[row.action] ?? row.action}
                          </td>
                          <td style={{ padding: "9px 12px" }}>
                            <span
                              className={`badge ${row.correct ? "badge-success" : "badge-danger"}`}
                            >
                              {row.correct ? "✓ Doğru" : "✗ Hatalı"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "9px 12px",
                              color: "var(--gray-600)",
                              fontFamily: "monospace",
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
  clicked_link: "Tıkladı",
  reported_phishing: "Raporladı",
  ignored: "Sildi",
  submitted_form: "Form Doldurdu",
};

function StatCard({
  value,
  label,
  danger,
  success,
}: {
  value: string | number;
  label: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="stat-card">
      <div
        className="value"
        style={{
          color: danger
            ? "var(--danger)"
            : success
            ? "var(--success)"
            : "var(--primary)",
        }}
      >
        {value}
      </div>
      <div className="label">{label}</div>
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
      Dashboard yükleniyor...
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500, textAlign: "center" }}>
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          {message}
        </div>
        <button className="btn-primary" onClick={onRetry}>
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
