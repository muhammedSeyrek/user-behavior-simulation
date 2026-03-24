# Phishing Awareness & User Behavior Simulation

Siber güvenlik farkındalığı için kullanıcı davranışı simülasyon platformu.
Tez ve akademik araştırma amaçlı geliştirilmiştir.

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 15 |
| Frontend | React 18 + Vite + TypeScript |
| Grafikler | Recharts |
| Deploy | Docker Compose |

## Hızlı Başlangıç

```bash
# 1. Ortam değişkenlerini kopyala
cp .env.example .env

# 2. Docker ile başlat
docker-compose up --build

# 3. Aç
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/docs
# Dashboard: http://localhost:5173/dashboard
```

## Proje Yapısı

```
├── backend/          # FastAPI uygulaması
│   └── app/
│       ├── main.py       # Giriş noktası
│       ├── models.py     # Veritabanı modelleri
│       ├── schemas.py    # Pydantic şemalar
│       ├── content.py    # Simülasyon içerikleri
│       └── api/          # Route handler'lar
├── frontend/         # React uygulaması
│   └── src/
│       ├── pages/        # Sayfa bileşenleri
│       └── api/          # Backend istemcisi
├── analysis/         # Jupyter Notebooks (Faz 1)
└── docker-compose.yml
```

## Simülasyon Akışı

1. **Ana Sayfa** → Kullanıcı demografik bilgilerini girer, rıza verir
2. **Simülasyon** → Rastgele phishing veya meşru e-posta gösterilir
3. **Karar** → Kullanıcı tıklar, raporlar veya siler
4. **Farkındalık** → Doğru karar açıklanır, phishing ipuçları sunulur
5. **Dashboard** → Araştırmacı verileri analiz eder

## API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/participants/` | Katılımcı oluştur |
| POST | `/api/sessions/` | Simülasyon oturumu başlat |
| GET | `/api/sessions/{id}/content` | Oturum içeriğini al |
| POST | `/api/interactions/` | Kullanıcı eylemini kaydet |
| GET | `/api/analytics/dashboard` | Dashboard istatistikleri |

## Etik

- Tüm katılımcılardan **açık rıza** alınır
- Gerçek kimlik bilgileri **asla saklanmaz**
- Veriler **anonimdir**
- Simülasyon sonunda **eğitim içeriği** sunulur
