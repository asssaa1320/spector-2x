const translations = {
    en: {
        'hero.title': 'Get Your Exclusive Coupon',
        'hero.subtitle': 'Limited time offer - Download your discount coupon now!',
        'coupon.title': 'SPECIAL DISCOUNT',
        'coupon.off': 'OFF',
        'coupon.description': 'Valid for all products and services. Don\'t miss this amazing opportunity!',
        'coupon.code': 'Code:',
        'coupon.button': 'Get Coupon Now',
        'features.limited': 'Limited Time',
        'features.secure': '100% Secure',
        'features.instant': 'Instant Download',
        'loading': 'Preparing your coupon...',
        'trust.secure': '100% Secure',
        'download.success': 'Downloaded!'
    },
    ar: {
        'hero.title': 'احصل على كوبون الخصم الحصري',
        'hero.subtitle': 'عرض لفترة محدودة - حمل كوبون الخصم الآن!',
        'coupon.title': 'خصم خاص',
        'coupon.off': 'خصم',
        'coupon.description': 'صالح لجميع المنتجات والخدمات. لا تفوت هذه الفرصة الرائعة!',
        'coupon.code': 'الكود:',
        'coupon.button': 'احصل على الكوبون الآن',
        'features.limited': 'وقت محدود',
        'features.secure': '100% آمن',
        'features.instant': 'تحميل فوري',
        'loading': 'جاري تحضير الكوبون...',
        'trust.secure': '100% آمن',
        'download.success': 'تم التحميل!'
    },
    es: {
        'hero.title': 'Obtén Tu Cupón Exclusivo',
        'hero.subtitle': '¡Oferta por tiempo limitado - Descarga tu cupón de descuento ahora!',
        'coupon.title': 'DESCUENTO ESPECIAL',
        'coupon.off': 'DESC',
        'coupon.description': 'Válido para todos los productos y servicios. ¡No te pierdas esta increíble oportunidad!',
        'coupon.code': 'Código:',
        'coupon.button': 'Obtener Cupón Ahora',
        'features.limited': 'Tiempo Limitado',
        'features.secure': '100% Seguro',
        'features.instant': 'Descarga Instantánea',
        'loading': 'Preparando tu cupón...',
        'trust.secure': '100% Seguro',
        'download.success': '¡Descargado!'
    },
    fr: {
        'hero.title': 'Obtenez Votre Coupon Exclusif',
        'hero.subtitle': 'Offre à durée limitée - Téléchargez votre coupon de réduction maintenant!',
        'coupon.title': 'REMISE SPÉCIALE',
        'coupon.off': 'REM',
        'coupon.description': 'Valable pour tous les produits et services. Ne manquez pas cette opportunité incroyable!',
        'coupon.code': 'Code:',
        'coupon.button': 'Obtenir le Coupon Maintenant',
        'features.limited': 'Temps Limité',
        'features.secure': '100% Sécurisé',
        'features.instant': 'Téléchargement Instantané',
        'loading': 'Préparation de votre coupon...',
        'trust.secure': '100% Sécurisé',
        'download.success': 'Téléchargé!'
    },
    de: {
        'hero.title': 'Holen Sie Sich Ihren Exklusiven Gutschein',
        'hero.subtitle': 'Zeitlich begrenztes Angebot - Laden Sie Ihren Rabattgutschein jetzt herunter!',
        'coupon.title': 'SONDERRABATT',
        'coupon.off': 'RAB',
        'coupon.description': 'Gültig für alle Produkte und Dienstleistungen. Verpassen Sie nicht diese großartige Gelegenheit!',
        'coupon.code': 'Code:',
        'coupon.button': 'Gutschein Jetzt Holen',
        'features.limited': 'Begrenzte Zeit',
        'features.secure': '100% Sicher',
        'features.instant': 'Sofortiger Download',
        'loading': 'Ihr Gutschein wird vorbereitet...',
        'trust.secure': '100% Sicher',
        'download.success': 'Heruntergeladen!'
    }
};

function translatePage(language) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    
    // Update HTML lang and dir attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
}

function detectUserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if we support this language
    if (translations[langCode]) {
        return langCode;
    }
    
    // Default to English
    return 'en';
}
