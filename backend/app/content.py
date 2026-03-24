"""
Simülasyon için hazır phishing ve meşru e-posta/sayfa içerikleri.
Gerçek bir saldırı amaçlanmamaktadır; tümü eğitim/araştırma simülasyonudur.
"""

import random

SIMULATION_CONTENT = [
    # ── PHISHİNG İÇERİKLERİ ─────────────────────────────────────────────────
    {
        "id": "phish_bank_01",
        "type": "phishing",
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
        "category": "it_support",
        "sender_name": "BT Destek Ekibi",
        "sender_email": "it-destek@sirket-bilgi.com",
        "subject": "Zorunlu: Şifrenizi bugün güncelleyin",
        "body": (
            "Tüm Çalışanlarımıza,\n\n"
            "Sistem güvenlik politikası gereği tüm kullanıcıların şifrelerini "
            "bugün mesai bitimine kadar güncellenmesi zorunludur. "
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

    # ── MEŞRU İÇERİKLER ─────────────────────────────────────────────────────
    {
        "id": "legit_newsletter_01",
        "type": "legitimate",
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
]


def get_random_content() -> dict:
    """A/B testi için rastgele bir içerik seç."""
    return random.choice(SIMULATION_CONTENT)


def get_content_by_id(content_id: str) -> dict | None:
    return next((c for c in SIMULATION_CONTENT if c["id"] == content_id), None)


def get_all_content() -> list[dict]:
    return SIMULATION_CONTENT
