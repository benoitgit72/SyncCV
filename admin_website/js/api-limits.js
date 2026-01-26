// ============================================
// API LIMITS MANAGEMENT
// Gestion des limites d'API pour l'admin panel
// ============================================

let currentLimits = [];
let limitsHistory = [];

// ============================================
// LOAD API LIMITS
// ============================================
async function loadAPILimits() {
    const limitsLoading = document.getElementById('limitsLoading');
    const limitsContent = document.getElementById('limitsContent');
    const limitsGrid = document.getElementById('limitsGrid');

    try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) {
            throw new Error('Not authenticated');
        }

        const token = session.data.session.access_token;

        const response = await fetch('/api/admin/get-api-limits', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load limits');
        }

        const data = await response.json();
        currentLimits = data.limits || [];

        // Hide loading, show content
        limitsLoading.style.display = 'none';
        limitsContent.style.display = 'block';

        // Render limits grid
        renderLimitsGrid(currentLimits, limitsGrid);

        // Load history
        loadLimitsHistory();

    } catch (error) {
        console.error('Error loading API limits:', error);
        limitsLoading.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <p style="color: var(--danger-color);">
                    Erreur lors du chargement des limites: ${error.message}
                </p>
                <button class="btn btn-primary" onclick="loadAPILimits()" style="margin-top: 15px;">
                    🔄 Réessayer
                </button>
            </div>
        `;
    }
}

// ============================================
// RENDER LIMITS GRID
// ============================================
function renderLimitsGrid(limits, container) {
    if (!limits || limits.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <p>Aucune limite configurée.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = limits.map(limit => {
        const labelText = currentAdminLanguage === 'en' ? limit.feature_label_en : limit.feature_label_fr;
        const descText = currentAdminLanguage === 'en' ? limit.description_en : limit.description_fr;
        const rateLimitText = limit.rate_limit_by === 'user_id' ? 'Par utilisateur' : 'Par adresse IP';

        return `
            <div class="limit-card" data-feature="${limit.feature_name}">
                <div class="limit-header">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">${labelText}</h4>
                        <p style="margin: 0; font-size: 0.85em; color: var(--text-secondary);">${descText}</p>
                        <span style="display: inline-block; margin-top: 8px; padding: 4px 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 4px; font-size: 0.75em; font-weight: 600;">
                            ${rateLimitText}
                        </span>
                    </div>
                </div>

                <div class="limit-inputs">
                    <div class="input-group">
                        <label>Par minute</label>
                        <input
                            type="number"
                            class="limit-input"
                            data-feature="${limit.feature_name}"
                            data-period="minute"
                            value="${limit.limit_per_minute || ''}"
                            placeholder="Illimité"
                            min="1"
                            max="10000"
                        >
                    </div>

                    <div class="input-group">
                        <label>Par heure</label>
                        <input
                            type="number"
                            class="limit-input"
                            data-feature="${limit.feature_name}"
                            data-period="hour"
                            value="${limit.limit_per_hour || ''}"
                            placeholder="Illimité"
                            min="1"
                            max="10000"
                        >
                    </div>

                    <div class="input-group">
                        <label>Par jour</label>
                        <input
                            type="number"
                            class="limit-input"
                            data-feature="${limit.feature_name}"
                            data-period="day"
                            value="${limit.limit_per_day || ''}"
                            placeholder="Illimité"
                            min="1"
                            max="10000"
                        >
                    </div>
                </div>

                <div class="limit-actions">
                    <button
                        class="btn btn-primary btn-sm save-limit-btn"
                        data-feature="${limit.feature_name}"
                        onclick="saveLimits('${limit.feature_name}')"
                    >
                        💾 Enregistrer
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add change event listeners to enable/disable save buttons
    container.querySelectorAll('.limit-input').forEach(input => {
        input.addEventListener('input', () => {
            const feature = input.dataset.feature;
            const saveBtn = container.querySelector(`.save-limit-btn[data-feature="${feature}"]`);
            if (saveBtn) {
                saveBtn.classList.add('btn-warning');
                saveBtn.innerHTML = '💾 Enregistrer les modifications';
            }
        });
    });
}

// ============================================
// SAVE LIMITS FOR A FEATURE
// ============================================
async function saveLimits(featureName) {
    const saveBtn = document.querySelector(`.save-limit-btn[data-feature="${featureName}"]`);
    if (!saveBtn) return;

    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '⏳ Enregistrement...';

    try {
        // Get input values
        const minuteInput = document.querySelector(`.limit-input[data-feature="${featureName}"][data-period="minute"]`);
        const hourInput = document.querySelector(`.limit-input[data-feature="${featureName}"][data-period="hour"]`);
        const dayInput = document.querySelector(`.limit-input[data-feature="${featureName}"][data-period="day"]`);

        const limitPerMinute = minuteInput.value === '' ? null : parseInt(minuteInput.value, 10);
        const limitPerHour = hourInput.value === '' ? null : parseInt(hourInput.value, 10);
        const limitPerDay = dayInput.value === '' ? null : parseInt(dayInput.value, 10);

        // Validate
        if (limitPerMinute !== null && (isNaN(limitPerMinute) || limitPerMinute < 1 || limitPerMinute > 10000)) {
            throw new Error('Limite par minute invalide (1-10000)');
        }
        if (limitPerHour !== null && (isNaN(limitPerHour) || limitPerHour < 1 || limitPerHour > 10000)) {
            throw new Error('Limite par heure invalide (1-10000)');
        }
        if (limitPerDay !== null && (isNaN(limitPerDay) || limitPerDay < 1 || limitPerDay > 10000)) {
            throw new Error('Limite par jour invalide (1-10000)');
        }

        const session = await supabase.auth.getSession();
        if (!session.data.session) {
            throw new Error('Not authenticated');
        }

        const token = session.data.session.access_token;

        const response = await fetch('/api/admin/update-api-limits', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feature_name: featureName,
                limit_per_minute: limitPerMinute,
                limit_per_hour: limitPerHour,
                limit_per_day: limitPerDay
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update limits');
        }

        const data = await response.json();

        // Show success message
        showToast(
            currentAdminLanguage === 'en'
                ? '✅ Limits updated successfully!'
                : '✅ Limites mises à jour avec succès!',
            'success'
        );

        // Reset button state
        saveBtn.classList.remove('btn-warning');
        saveBtn.innerHTML = originalText;

        // Reload limits and history
        await loadAPILimits();

    } catch (error) {
        console.error('Error saving limits:', error);
        showToast(
            currentAdminLanguage === 'en'
                ? '❌ Error: ' + error.message
                : '❌ Erreur: ' + error.message,
            'error'
        );

        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// ============================================
// LOAD LIMITS HISTORY
// ============================================
async function loadLimitsHistory() {
    const historyLoading = document.getElementById('limitsHistoryLoading');
    const historyContent = document.getElementById('limitsHistoryContent');
    const historyEmpty = document.getElementById('limitsHistoryEmpty');
    const historyBody = document.getElementById('limitsHistoryBody');

    try {
        const { data: history, error } = await supabase
            .from('api_limits_history')
            .select(`
                *,
                changed_by_profile:profiles!api_limits_history_changed_by_fkey(id, slug)
            `)
            .order('changed_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        historyLoading.style.display = 'none';

        if (!history || history.length === 0) {
            historyEmpty.style.display = 'block';
            historyContent.style.display = 'none';
            return;
        }

        limitsHistory = history;

        // Render history table
        historyBody.innerHTML = history.map(entry => {
            const date = new Date(entry.changed_at);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const featureLimit = currentLimits.find(l => l.feature_name === entry.feature_name);
            const featureName = featureLimit
                ? (currentAdminLanguage === 'en' ? featureLimit.feature_label_en : featureLimit.feature_label_fr)
                : entry.feature_name;

            const changedBy = entry.changed_by_profile?.slug || 'Admin';

            const formatChange = (oldVal, newVal) => {
                const oldText = oldVal === null ? '∞' : oldVal;
                const newText = newVal === null ? '∞' : newVal;

                if (oldVal === newVal) {
                    return `<span style="color: var(--text-secondary);">${newText}</span>`;
                }

                return `<span style="color: var(--danger-color); text-decoration: line-through;">${oldText}</span> → <span style="color: var(--success-color); font-weight: 600;">${newText}</span>`;
            };

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td><strong>${featureName}</strong></td>
                    <td>${formatChange(entry.old_limit_per_minute, entry.new_limit_per_minute)}</td>
                    <td>${formatChange(entry.old_limit_per_hour, entry.new_limit_per_hour)}</td>
                    <td>${formatChange(entry.old_limit_per_day, entry.new_limit_per_day)}</td>
                    <td>${changedBy}</td>
                </tr>
            `;
        }).join('');

        historyContent.style.display = 'block';

    } catch (error) {
        console.error('Error loading history:', error);
        historyLoading.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--danger-color);">
                Erreur lors du chargement de l'historique: ${error.message}
            </div>
        `;
    }
}

// ============================================
// INITIALIZE WHEN SECTION IS SHOWN
// ============================================
function initAPILimitsSection() {
    console.log('📊 Initializing API Limits section...');
    loadAPILimits();
}

// Auto-load when section becomes visible
const limitsSection = document.getElementById('section-limits');
if (limitsSection) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
                if (!limitsSection.hidden && currentLimits.length === 0) {
                    initAPILimitsSection();
                }
            }
        });
    });

    observer.observe(limitsSection, { attributes: true });
}

console.log('✅ API Limits module loaded');
