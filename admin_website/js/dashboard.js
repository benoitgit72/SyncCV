// ============================================
// Admin Dashboard - Main Logic
// ============================================

let currentUser = null;
let currentProfile = null;

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation du dashboard admin...');

    // Require admin authentication
    currentUser = await requireAdmin();
    if (!currentUser) return;

    // Load user profile
    await loadUserProfile();

    // Setup navigation
    setupNavigation();

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', signOut);
    }

    // Load initial section
    await loadSection('statistics');
});

/**
 * Load user profile and display user info
 */
async function loadUserProfile() {
    try {
        currentProfile = await getUserProfile(currentUser.id);

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (currentProfile) {
            // Try to get CV info for display name
            const cvInfo = await getCVInfo(currentUser.id);
            const displayName = cvInfo?.nom || currentUser.email?.split('@')[0] || 'Admin';

            if (userName) userName.textContent = displayName;
            if (userEmail) userEmail.textContent = 'Administrator';
            if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error('Erreur chargement profil:', error);
    }
}

/**
 * Setup navigation between sections
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Load section
            const section = item.dataset.section;
            await loadSection(section);
        });
    });
}

/**
 * Load a specific section
 */
async function loadSection(sectionName) {
    console.log(`📄 Chargement de la section: ${sectionName}`);

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.hidden = true;
    });

    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.hidden = false;
    }

    // Update title
    const titles = {
        'limits': 'API Limits Management',
        'statistics': 'Statistics Dashboard',
        'communication': 'Communication Center'
    };

    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
        sectionTitle.textContent = titles[sectionName] || sectionName;
    }

    // Load section data
    try {
        switch (sectionName) {
            case 'limits':
                // API limits section loads automatically via api-limits.js
                break;
            case 'statistics':
                await loadStatistics();
                break;
            case 'communication':
                await loadCommunication();
                break;
            default:
                console.warn(`Section inconnue: ${sectionName}`);
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de ${sectionName}:`, error);
        showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.hidden = false;

    setTimeout(() => {
        toast.hidden = true;
    }, 3000);
}

/**
 * Get CV Info for current user (helper function)
 */
async function getCVInfo(userId) {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('cv_info')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erreur getCVInfo:', error);
        return null;
    }
}
