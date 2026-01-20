// ============================================
// Configuration du client Supabase
// ============================================

// Attendre que la bibliothèque Supabase soit chargée
let supabaseClient = null;

function initSupabase() {
    // Configuration Supabase
    const SUPABASE_URL = 'https://btcdbewqypejzmlwwedz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2RiZXdxeXBlanptbHd3ZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzYwOTUsImV4cCI6MjA4NDUxMjA5NX0.YL7UuvIE9DGdvfjGHNk3JvV2Go7hB83eNMvx2h6mjvw';

    // Vérifier que la bibliothèque Supabase est chargée
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Bibliothèque Supabase non chargée');
        return null;
    }

    // Créer le client Supabase
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Client Supabase initialisé');

    return supabaseClient;
}

// Fonction pour obtenir le client Supabase
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = initSupabase();
    }
    return supabaseClient;
}
