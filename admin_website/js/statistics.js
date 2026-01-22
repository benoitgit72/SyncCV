// ============================================
// Statistics Module
// ============================================

/**
 * Load statistics section
 */
async function loadStatistics() {
    console.log('📊 Loading statistics...');

    try {
        await Promise.all([
            loadVisitStats(),
            loadTopCVs()
        ]);
    } catch (error) {
        console.error('Error loading statistics:', error);
        showToast('Erreur chargement statistiques', 'error');
    }
}

/**
 * Load visit statistics (today, week, month, previous month)
 */
async function loadVisitStats() {
    const supabase = getSupabaseClient();

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Today's visits
    const { count: todayCount, error: todayError } = await supabase
        .from('cv_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', today.toISOString());

    if (!todayError) {
        const element = document.getElementById('visitsToday');
        if (element) element.textContent = todayCount || 0;
    }

    // This week's visits
    const { count: weekCount, error: weekError } = await supabase
        .from('cv_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', weekAgo.toISOString());

    if (!weekError) {
        const element = document.getElementById('visitsWeek');
        if (element) element.textContent = weekCount || 0;
    }

    // This month's visits
    const { count: monthCount, error: monthError } = await supabase
        .from('cv_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', monthStart.toISOString());

    if (!monthError) {
        const element = document.getElementById('visitsMonth');
        if (element) element.textContent = monthCount || 0;
    }

    // Previous month's visits
    const { count: prevMonthCount, error: prevMonthError } = await supabase
        .from('cv_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', prevMonthStart.toISOString())
        .lte('visited_at', prevMonthEnd.toISOString());

    if (!prevMonthError) {
        const element = document.getElementById('visitsPrevMonth');
        if (element) element.textContent = prevMonthCount || 0;
    }
}

/**
 * Load top visited CVs
 */
async function loadTopCVs() {
    const supabase = getSupabaseClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all visits from last 30 days
    const { data: visits, error: visitsError } = await supabase
        .from('cv_visits')
        .select('user_id, slug, visited_at')
        .gte('visited_at', thirtyDaysAgo.toISOString());

    if (visitsError) {
        console.error('Error loading top CVs:', visitsError);
        return;
    }

    if (!visits || visits.length === 0) {
        displayEmptyTopCVs();
        return;
    }

    // Count visits per user
    const visitCounts = {};
    visits.forEach(visit => {
        if (!visitCounts[visit.user_id]) {
            visitCounts[visit.user_id] = {
                slug: visit.slug,
                visits7d: 0,
                visits30d: 0
            };
        }
        visitCounts[visit.user_id].visits30d++;

        const visitDate = new Date(visit.visited_at);
        if (visitDate >= sevenDaysAgo) {
            visitCounts[visit.user_id].visits7d++;
        }
    });

    // Get user names
    const userIds = Object.keys(visitCounts);
    const { data: cvInfos, error: cvError } = await supabase
        .from('cv_info')
        .select('user_id, nom')
        .in('user_id', userIds);

    if (cvError) {
        console.error('Error loading CV info:', cvError);
    }

    // Merge data
    const topCVs = userIds.map(userId => {
        const cvInfo = cvInfos?.find(cv => cv.user_id === userId);
        return {
            name: cvInfo?.nom || 'Unknown',
            slug: visitCounts[userId].slug,
            visits7d: visitCounts[userId].visits7d,
            visits30d: visitCounts[userId].visits30d
        };
    });

    // Sort by 30-day visits (descending)
    topCVs.sort((a, b) => b.visits30d - a.visits30d);

    // Display top 10
    displayTopCVs(topCVs.slice(0, 10));
}

/**
 * Display top CVs in the table
 */
function displayTopCVs(topCVs) {
    const tbody = document.getElementById('topCvsBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (topCVs.length === 0) {
        displayEmptyTopCVs();
        return;
    }

    topCVs.forEach(cv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(cv.name)}</td>
            <td><a href="/${escapeHtml(cv.slug)}" target="_blank">${escapeHtml(cv.slug)}</a></td>
            <td>${cv.visits7d}</td>
            <td>${cv.visits30d}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Display empty state for top CVs table
 */
function displayEmptyTopCVs() {
    const tbody = document.getElementById('topCvsBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">Aucune visite enregistrée</td></tr>';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
