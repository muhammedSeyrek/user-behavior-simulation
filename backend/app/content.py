"""
Simülasyon için hazır phishing ve meşru e-posta/sayfa içerikleri.
Gerçek bir saldırı amaçlanmamaktadır; tümü eğitim/araştırma simülasyonudur.
"""

import random

SIMULATION_CONTENT = [
    # ── E-POSTA — PHISHİNG ──────────────────────────────────────────────────
    {
        "id": "phish_bank_01",
        "type": "phishing",
        "format": "email",
        "category": "bank",
        "sender_name": "Garanti BBVA Güvenlik",
        "sender_email": "guvenlik@garantibbva-destek.net",
        "subject": "⚠️ Hesabınız askıya alındı - Acil işlem gerekli",
        "body": (
            "Sayın Müşterimiz,\n\n"
            "Hesabınızda şüpheli işlem tespit edilmiştir. "
            "Hesabınızın güvenliği için kimliğinizi 24 saat içinde doğrulamanız gerekmektedir. "
            "Aksi takdirde hesabınız kalıcı olarak kısıtlanacaktır.\n\n"
            "Kimliğinizi doğrulamak için aşağıdaki bağlantıya tıklayın:"
        ),
        "link_text": "Kimliğimi Doğrula",
        "link_url": "#simulation-click",
        "warning_signs": [
            "Gönderen adresi resmi domain değil (@garantibbva-destek.net)",
            "Aciliyet hissi yaratılıyor ('24 saat içinde')",
            "Kişisel olmayan selamlama ('Sayın Müşterimiz')",
            "Tehdit içeriyor ('kalıcı olarak kısıtlanacaktır')",
        ],
    },
    {
        "id": "phish_it_01",
        "type": "phishing",
        "format": "email",
        "category": "it_support",
        "sender_name": "BT Destek Ekibi",
        "sender_email": "it-destek@sirket-bilgi.com",
        "subject": "Zorunlu: Şifrenizi bugün güncelleyin",
        "body": (
            "Tüm Çalışanlarımıza,\n\n"
            "Sistem güvenlik politikası gereği tüm kullanıcıların şifrelerini "
            "bugün mesai bitimine kadar güncellemesi zorunludur. "
            "Şifrenizi güncellemezseniz sisteme erişiminiz engellenecektir.\n\n"
            "Şifrenizi güncellemek için:"
        ),
        "link_text": "Şifreyi Güncelle",
        "link_url": "#simulation-click",
        "warning_signs": [
            "Gönderen adresi kurumsal değil (@sirket-bilgi.com)",
            "Mesai bitimine kadar acil eylem baskısı",
            "BT departmanları şifre sıfırlamayı e-posta ile talep etmez",
            "Tehdit unsuru var ('erişiminiz engellenecektir')",
        ],
    },
    {
        "id": "phish_prize_01",
        "type": "phishing",
        "format": "email",
        "category": "prize",
        "sender_name": "Amazon Türkiye Ödüller",
        "sender_email": "oduller@amazon-tr-kampanya.com",
        "subject": "Tebrikler! 5.000 TL değerinde ödül kazandınız 🎉",
        "body": (
            "Sevgili Kullanıcı,\n\n"
            "Bu yılki yıllık çekilişimizde 5.000 TL değerinde Amazon hediye çeki kazandınız! "
            "Ödülünüzü talep etmek için 48 saat süreniz bulunmaktadır. "
            "Hesap bilgilerinizi doğrulayarak ödülünüzü hemen alın."
        ),
        "link_text": "Ödülümü Al",
        "link_url": "#simulation-click",
        "warning_signs": [
            "Gönderen adresi resmi Amazon domain'i değil",
            "Katılmadığınız bir çekilişte ödül kazandığınız iddiası",
            "48 saat süresi ile aciliyet baskısı",
            "Hesap bilgisi talep ediliyor",
        ],
    },

    # ── E-POSTA — MEŞRU ─────────────────────────────────────────────────────
    {
        "id": "legit_newsletter_01",
        "type": "legitimate",
        "format": "email",
        "category": "newsletter",
        "sender_name": "Medium Daily Digest",
        "sender_email": "noreply@medium.com",
        "subject": "Bu hafta en çok okunan yazılar",
        "body": (
            "Merhaba,\n\n"
            "Bu hafta platformumuzda en çok ilgi gören yazıları sizin için derledik. "
            "Teknoloji, tasarım ve girişimcilik alanlarında seçkin içerikler sizi bekliyor.\n\n"
            "Keşfetmek için:"
        ),
        "link_text": "Yazıları Oku",
        "link_url": "#simulation-legit",
        "warning_signs": [],
    },
    {
        "id": "legit_meeting_01",
        "type": "legitimate",
        "format": "email",
        "category": "meeting",
        "sender_name": "Google Takvim",
        "sender_email": "calendar-notification@google.com",
        "subject": "Hatırlatıcı: Yarın saat 10:00 - Haftalık Ekip Toplantısı",
        "body": (
            "Merhaba,\n\n"
            "Yarın gerçekleşecek toplantı için hatırlatıcı:\n\n"
            "📅 Tarih: Yarın, 10:00 - 11:00\n"
            "📍 Konum: Google Meet\n"
            "👥 Davet edenler: 5 kişi\n\n"
            "Toplantıya katılmak için:"
        ),
        "link_text": "Google Meet'e Katıl",
        "link_url": "#simulation-legit",
        "warning_signs": [],
    },
    {
        "id": "legit_system_01",
        "type": "legitimate",
        "format": "email",
        "category": "system",
        "sender_name": "GitHub",
        "sender_email": "noreply@github.com",
        "subject": "Güvenlik uyarısı: Yeni oturum açıldı",
        "body": (
            "Merhaba,\n\n"
            "GitHub hesabınıza yeni bir oturum açıldı:\n\n"
            "📍 Konum: İstanbul, Türkiye\n"
            "💻 Cihaz: Chrome / Windows\n"
            "🕐 Zaman: Az önce\n\n"
            "Bu siz değilseniz şifrenizi hemen değiştirin. "
            "Bu girişi siz yaptıysanız bu e-postayı görmezden gelebilirsiniz.\n\n"
            "Hesabınızı kontrol etmek için:"
        ),
        "link_text": "Hesabımı Görüntüle",
        "link_url": "#simulation-legit",
        "warning_signs": [],
    },

    # ── WEB SAYFASI — PHISHİNG ───────────────────────────────────────────────
    {
        "id": "web_phish_bank_01",
        "type": "phishing",
        "format": "web",
        "category": "bank",
        "brand": "Garanti BBVA",
        "favicon": "🏦",
        "fake_url": "https://garantibbva-guvenlik.net/dogrula",
        "page_title": "Hesap Güvenlik Doğrulaması",
        "headline": "Hesabınız Güvenlik Nedeniyle Kısıtlandı",
        "subtext": "Kimliğinizi doğrulamak için müşteri numaranızı ve internet şifrenizi giriniz.",
        "fields": [
            {"label": "Müşteri Numarası", "type": "text", "placeholder": "T.C. kimlik numaranız"},
            {"label": "İnternet Şifresi", "type": "password", "placeholder": "••••••••"},
        ],
        "submit_text": "Kimliğimi Doğrula",
        "warning_signs": [
            "URL 'garantibbva-guvenlik.net' — resmi domain 'garantibbva.com.tr' değil",
            "Bankalar asla web formuyla şifre talep etmez",
            "HTTPS olsa bile sahte domain güvenli değildir",
            "T.C. kimlik numarası ile şifre aynı anda isteniyor",
        ],
    },
    {
        "id": "web_phish_corp_01",
        "type": "phishing",
        "format": "web",
        "category": "corporate",
        "brand": "Microsoft 365",
        "favicon": "🔷",
        "fake_url": "https://microsoft365-oturum.net/tr/giris",
        "page_title": "Microsoft'a Oturum Açın",
        "headline": "Oturumunuzun süresi doldu",
        "subtext": "Devam etmek için Microsoft hesabınızla yeniden giriş yapın.",
        "fields": [
            {"label": "E-posta veya telefon", "type": "email", "placeholder": "ornek@sirket.com"},
            {"label": "Parola", "type": "password", "placeholder": "••••••••"},
        ],
        "submit_text": "Oturum Aç",
        "warning_signs": [
            "URL 'microsoft365-oturum.net' — resmi 'login.microsoftonline.com' değil",
            "Meşru Microsoft sayfaları hiçbir zaman üçüncü parti domain kullanmaz",
            "Oturum süresi doldu bildirimi sizi sahte sayfaya yönlendirebilir",
        ],
    },
    {
        "id": "web_phish_cargo_01",
        "type": "phishing",
        "format": "web",
        "category": "delivery",
        "brand": "Yurtiçi Kargo",
        "favicon": "📦",
        "fake_url": "https://yurtici-kargo-takip.com/teslim-guncelle",
        "page_title": "Kargo Teslim Bildirimi",
        "headline": "Kargonuz Teslim Edilemedi",
        "subtext": "Adres güncellemesi için 2,90 TL gümrük ücreti ödenmesi gerekmektedir.",
        "fields": [
            {"label": "Kart Numarası", "type": "text", "placeholder": "0000 0000 0000 0000"},
            {"label": "Son Kullanma Tarihi", "type": "text", "placeholder": "AA/YY"},
            {"label": "CVV", "type": "password", "placeholder": "•••"},
        ],
        "submit_text": "Ödemeyi Tamamla",
        "warning_signs": [
            "Kargo şirketleri asla ödeme formu göndermez",
            "URL 'yurtici-kargo-takip.com' — resmi 'yurticikargo.com' değil",
            "Küçük bir ücret bahanesiyle kart bilgisi çalınıyor",
        ],
    },
    {
        "id": "web_phish_ecom_01",
        "type": "phishing",
        "format": "web",
        "category": "ecommerce",
        "brand": "Amazon",
        "favicon": "🛍️",
        "fake_url": "https://amazon-tr-hesap.com/odeme/guncelle",
        "page_title": "Ödeme Bilgisi Güncelleme",
        "headline": "Hesabınızda Ödeme Sorunu Tespit Edildi",
        "subtext": "Son siparişiniz işleme alınamadı. Devam etmek için ödeme bilgilerinizi güncelleyin.",
        "fields": [
            {"label": "Kart Üzerindeki İsim", "type": "text", "placeholder": "Ad Soyad"},
            {"label": "Kart Numarası", "type": "text", "placeholder": "0000 0000 0000 0000"},
            {"label": "Son Kullanma", "type": "text", "placeholder": "AA/YY"},
            {"label": "CVV", "type": "password", "placeholder": "•••"},
        ],
        "submit_text": "Güncelle ve Devam Et",
        "warning_signs": [
            "URL 'amazon-tr-hesap.com' — resmi 'amazon.com.tr' değil",
            "Amazon ödeme sorunlarını e-posta / web formu ile çözmez",
            "4 alanda kart bilgisi talep ediliyor",
        ],
    },

    # ── WEB SAYFASI — MEŞRU ─────────────────────────────────────────────────
    {
        "id": "web_legit_bank_01",
        "type": "legitimate",
        "format": "web",
        "category": "bank",
        "brand": "İş Bankası",
        "favicon": "🏛️",
        "fake_url": "https://isbank.com.tr/bireysel/giris",
        "page_title": "İnternet Bankacılığı",
        "headline": "İş Bankası İnternet Bankacılığı",
        "subtext": "Güvenli bağlantı ile hesabınıza giriş yapın.",
        "fields": [
            {"label": "Müşteri Numarası", "type": "text", "placeholder": "Müşteri numaranız"},
            {"label": "İnternet Şifresi", "type": "password", "placeholder": "••••••••"},
        ],
        "submit_text": "Giriş Yap",
        "warning_signs": [],
    },
    {
        "id": "web_legit_corp_01",
        "type": "legitimate",
        "format": "web",
        "category": "corporate",
        "brand": "Kurumsal VPN Portalı",
        "favicon": "🔐",
        "fake_url": "https://vpn.sirketim.com.tr/uzak-erisim",
        "page_title": "Uzaktan Erişim Portalı",
        "headline": "Kurumsal Ağa Güvenli Bağlan",
        "subtext": "Uzaktan çalışmak için kurumsal kimlik bilgilerinizi girin.",
        "fields": [
            {"label": "Kullanıcı Adı", "type": "text", "placeholder": "ad.soyad"},
            {"label": "Şifre", "type": "password", "placeholder": "••••••••"},
        ],
        "submit_text": "Bağlan",
        "warning_signs": [],
    },
]


def get_random_content() -> dict:
    """A/B testi için rastgele bir içerik seç."""
    return random.choice(SIMULATION_CONTENT)


def get_n_unique_content(n: int) -> list[dict]:
    """n adet tekrarsız içerik döndür (karıştırılmış)."""
    pool = SIMULATION_CONTENT.copy()
    random.shuffle(pool)
    return pool[:n]


def get_content_by_id(content_id: str) -> dict | None:
    return next((c for c in SIMULATION_CONTENT if c["id"] == content_id), None)


def get_all_content() -> list[dict]:
    return SIMULATION_CONTENT
