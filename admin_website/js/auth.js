// ============================================
// Module d'authentification pour l'admin
// ============================================

/**
 * Connecte un utilisateur avec email et mot de passe
 */
async function signIn(email, password, rememberMe = false) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        console.log('✅ Connexion réussie:', data.user.email);

        // Store session preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        return data;
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        throw error;
    }
}

/**
 * Déconnecte l'utilisateur actuel
 */
async function signOut() {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('✅ Déconnexion réussie');
        localStorage.removeItem('rememberMe');

        // Redirect to login
        window.location.href = './login.html';
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
        throw error;
    }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
async function getCurrentUser() {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        return user;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
    }
}

/**
 * Récupère la session actuelle
 */
async function getSession() {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        return session;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la session:', error);
        return null;
    }
}

/**
 * Réinitialise le mot de passe
 */
async function resetPassword(email) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin_cv/reset-password.html`,
        });

        if (error) throw error;

        console.log('✅ Email de réinitialisation envoyé');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
        throw error;
    }
}

/**
 * Vérifie si l'utilisateur est authentifié et redirige si nécessaire
 */
async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        console.log('⚠️ Utilisateur non authentifié, redirection vers login');
        window.location.href = './login.html';
        return null;
    }

    return user;
}

/**
 * Récupère le profil de l'utilisateur (profiles table)
 */
async function getUserProfile(userId) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du profil:', error);
        throw error;
    }
}

/**
 * Configure les listeners pour les changements d'authentification
 */
function setupAuthListeners() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error('❌ Client Supabase non initialisé');
        return;
    }

    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);

        if (event === 'SIGNED_OUT') {
            window.location.href = './login.html';
        } else if (event === 'SIGNED_IN') {
            console.log('✅ User signed in:', session.user.email);
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed');
        } else if (event === 'USER_UPDATED') {
            console.log('👤 User updated');
        }
    });
}

// Initialiser les listeners au chargement de la page
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setupAuthListeners();
    });
}

/**
 * Vérifie si l'utilisateur est un administrateur
 */
async function isAdmin(userId) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return data?.is_admin === true;
    } catch (error) {
        console.error('❌ Erreur vérification admin:', error);
        return false;
    }
}

/**
 * Require admin authentication
 * Vérifie que l'utilisateur est authentifié ET admin
 */
async function requireAdmin() {
    const user = await requireAuth();
    if (!user) return null;

    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
        console.log('⚠️ Accès refusé - droits admin requis');
        alert('Accès refusé. Droits administrateur requis.');
        await signOut();
        return null;
    }

    return user;
}
