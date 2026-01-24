// ============================================
// Theme Manager - Handle color theme selection
// ============================================

/**
 * Apply theme to the body element
 */
function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);

    // Update active state on theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === themeName) {
            option.classList.add('active');
        }
    });
}

/**
 * Load user's selected theme from profile
 */
async function loadUserTheme(userId) {
    try {
        const profile = await getUserProfile(userId);
        const theme = profile?.theme || 'purple-gradient';
        applyTheme(theme);
        return theme;
    } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
        applyTheme('purple-gradient'); // Fallback to default
        return 'purple-gradient';
    }
}

/**
 * Save theme selection to database
 */
async function saveTheme(userId, themeName) {
    try {
        await updateProfile(userId, { theme: themeName });
        applyTheme(themeName);
        console.log('✅ Thème sauvegardé:', themeName);
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du thème:', error);
        throw error;
    }
}

/**
 * Setup theme selector in settings
 */
function setupThemeSelector(userId) {
    const themeOptions = document.querySelectorAll('.theme-option');

    themeOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const themeName = option.dataset.theme;

            // Apply theme immediately for preview
            applyTheme(themeName);

            try {
                // Save to database
                await saveTheme(userId, themeName);
                showToast('Thème appliqué avec succès', 'success');
            } catch (error) {
                showToast('Erreur lors de la sauvegarde du thème', 'error');
            }
        });
    });
}

/**
 * Initialize theme on page load
 */
async function initializeTheme(userId) {
    try {
        const theme = await loadUserTheme(userId);
        console.log('🎨 Thème chargé:', theme);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du thème:', error);
    }
}
