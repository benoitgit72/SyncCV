// ============================================
// Admin Language Manager - SyncCV
// ============================================

let currentAdminLang = localStorage.getItem('adminLanguage') || 'fr';

/**
 * Initialize language system
 */
function initializeAdminLanguage() {
    // Apply saved language
    applyAdminLanguage(currentAdminLang);

    // Setup language toggle button
    const langToggle = document.getElementById('adminLanguageToggle');
    if (langToggle) {
        updateLanguageButton();
        langToggle.addEventListener('click', toggleAdminLanguage);
    }
}

/**
 * Toggle between French and English
 */
function toggleAdminLanguage() {
    currentAdminLang = currentAdminLang === 'fr' ? 'en' : 'fr';
    localStorage.setItem('adminLanguage', currentAdminLang);
    applyAdminLanguage(currentAdminLang);
    updateLanguageButton();
}

/**
 * Update language button display
 */
function updateLanguageButton() {
    const langToggle = document.getElementById('adminLanguageToggle');
    if (!langToggle) return;

    const flagIcon = langToggle.querySelector('.flag-icon');
    const langText = langToggle.querySelector('.lang-text');

    if (currentAdminLang === 'fr') {
        flagIcon.textContent = '🇫🇷';
        langText.textContent = 'FR';
    } else {
        flagIcon.textContent = '🇬🇧';
        langText.textContent = 'EN';
    }
}

/**
 * Apply language to all translatable elements
 */
function applyAdminLanguage(lang) {
    const translations = adminTranslations[lang];
    if (!translations) {
        console.error(`Traductions non trouvées pour la langue: ${lang}`);
        return;
    }

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // Check if it's an input placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translations[key];
                }
            } else {
                element.textContent = translations[key];
            }
        }
    });

    // Translate all elements with data-i18n-label attribute (for labels)
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
        const key = element.getAttribute('data-i18n-label');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    // Translate all elements with data-i18n-title attribute (for titles)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[key]) {
            element.setAttribute('title', translations[key]);
        }
    });

    console.log(`✅ Langue admin appliquée: ${lang}`);
}

/**
 * Get current translation
 */
function getAdminTranslation(key) {
    const translations = adminTranslations[currentAdminLang];
    return translations[key] || key;
}

/**
 * Get current admin language
 */
function getCurrentAdminLanguage() {
    return currentAdminLang;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminLanguage);
} else {
    initializeAdminLanguage();
}
