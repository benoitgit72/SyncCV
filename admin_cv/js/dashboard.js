// ============================================
// Dashboard principal - SyncCV Admin
// ============================================

let currentUser = null;
let currentProfile = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation du dashboard...');

    // Require authentication
    currentUser = await requireAuth();
    if (!currentUser) return;

    // Load user profile
    await loadUserProfile();

    // Initialize theme
    await initializeTheme(currentUser.id);

    // Setup navigation
    setupNavigation();

    // Setup sidebar toggle
    setupSidebarToggle();

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', signOut);

    // Load initial section
    await loadSection('personal-info');
});

/**
 * Load user profile and display user info
 */
async function loadUserProfile() {
    try {
        currentProfile = await getUserProfile(currentUser.id);

        // Update user info in sidebar
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (currentProfile) {
            // Try to get name from cv_info
            const cvInfo = await getCVInfo(currentUser.id);
            const displayName = cvInfo?.nom || currentUser.email.split('@')[0];

            userName.textContent = displayName;
            userEmail.textContent = currentUser.email;
            userAvatar.textContent = displayName.charAt(0).toUpperCase();

            // Update preview CV link
            const previewLink = document.getElementById('previewCV');
            previewLink.href = `/${currentProfile.slug}`;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        showToast('Erreur lors du chargement du profil', 'error');
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
 * Setup sidebar toggle functionality
 */
function setupSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    // Load saved state from localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    // Toggle on button click
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');

        // Save state to localStorage
        const collapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', collapsed);
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

    // Update title with translation
    const titleKeys = {
        'personal-info': 'section_personal_info',
        'experiences': 'section_experiences',
        'formations': 'section_formations',
        'competences': 'section_competences',
        'settings': 'section_settings'
    };
    const sectionTitle = document.getElementById('sectionTitle');
    const titleKey = titleKeys[sectionName];
    if (titleKey && typeof getAdminTranslation === 'function') {
        sectionTitle.textContent = getAdminTranslation(titleKey);
        sectionTitle.setAttribute('data-i18n', titleKey);
    }

    // Load section data
    try {
        switch (sectionName) {
            case 'personal-info':
                await loadPersonalInfo();
                break;
            case 'experiences':
                await loadExperiences();
                break;
            case 'formations':
                await loadFormations();
                break;
            case 'competences':
                await loadCompetences();
                break;
            case 'settings':
                await loadSettings();
                break;
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de ${sectionName}:`, error);
        showToast('Erreur lors du chargement des données', 'error');
    }
}

/**
 * Load personal info section
 */
async function loadPersonalInfo() {
    const form = document.getElementById('personalInfoForm');
    const cvInfo = await getCVInfo(currentUser.id);

    if (cvInfo) {
        // Populate form
        Object.keys(cvInfo).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && cvInfo[key] !== null) {
                input.value = cvInfo[key];
            }
        });

        // Load photo preview
        if (cvInfo.photo_url) {
            loadPhotoPreview(cvInfo.photo_url);
        }
    }

    // Setup photo upload
    setupPhotoUpload();

    // Setup form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            await upsertCVInfo(currentUser.id, data);
            showToast('Informations sauvegardées avec succès', 'success');
            await loadUserProfile(); // Refresh sidebar
        } catch (error) {
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };
}

/**
 * Setup photo upload functionality
 */
function setupPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const deleteBtn = document.getElementById('deletePhotoBtn');
    const photoPreview = document.getElementById('photoPreview');

    // Click on button opens file picker
    uploadBtn.onclick = () => {
        photoInput.click();
    };

    // Handle file selection
    photoInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Show loading
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="spinner"></span> Upload en cours...';

            // Upload to Supabase Storage (d'abord uploader)
            const photoUrl = await uploadProfilePhoto(currentUser.id, file);

            // Update hidden input and save to database
            document.getElementById('photo_url').value = photoUrl;
            await upsertCVInfo(currentUser.id, { photo_url: photoUrl });

            // Attendre un peu que Supabase finalise l'upload et propage le fichier
            await new Promise(resolve => setTimeout(resolve, 500));

            // Charger la photo depuis Supabase avec cache busting
            const urlWithTimestamp = `${photoUrl}?t=${Date.now()}`;

            // Créer une nouvelle image pour forcer le rechargement
            const newImg = new Image();
            newImg.onload = () => {
                photoPreview.src = urlWithTimestamp;
                photoPreview.style.display = 'block';

                // Cacher le placeholder
                const photoPlaceholder = document.getElementById('photoPlaceholder');
                if (photoPlaceholder) {
                    photoPlaceholder.style.display = 'none';
                }

                // Show success
                showToast('Photo uploadée avec succès', 'success');
                deleteBtn.style.display = 'inline-flex';
            };

            newImg.onerror = () => {
                // Si l'image ne charge pas, essayer quand même d'afficher
                photoPreview.src = urlWithTimestamp;
                photoPreview.style.display = 'block';

                const photoPlaceholder = document.getElementById('photoPlaceholder');
                if (photoPlaceholder) {
                    photoPlaceholder.style.display = 'none';
                }

                showToast('Photo uploadée', 'success');
                deleteBtn.style.display = 'inline-flex';
            };

            // Déclencher le chargement
            newImg.src = urlWithTimestamp;

        } catch (error) {
            console.error('Erreur upload:', error);
            showToast(error.message || 'Erreur lors de l\'upload', 'error');
        } finally {
            // Reset button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '📸 Choisir une photo';
            photoInput.value = ''; // Reset input
        }
    };

    // Handle photo deletion
    deleteBtn.onclick = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil?')) {
            return;
        }

        try {
            deleteBtn.disabled = true;

            // Delete from storage
            await deleteProfilePhoto(currentUser.id);

            // Update database
            await upsertCVInfo(currentUser.id, { photo_url: null });

            // Clear preview
            photoPreview.style.display = 'none';
            photoPreview.src = '';
            document.getElementById('photoPlaceholder').style.display = 'flex';
            document.getElementById('photo_url').value = '';
            deleteBtn.style.display = 'none';

            showToast('Photo supprimée', 'success');

        } catch (error) {
            console.error('Erreur suppression:', error);
            showToast('Erreur lors de la suppression', 'error');
        } finally {
            deleteBtn.disabled = false;
        }
    };
}

/**
 * Load photo preview
 */
function loadPhotoPreview(photoUrl) {
    if (!photoUrl) return;

    const photoPreview = document.getElementById('photoPreview');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const deleteBtn = document.getElementById('deletePhotoBtn');

    // Ajouter un timestamp pour forcer le rechargement (cache busting)
    const urlWithTimestamp = photoUrl.includes('?')
        ? `${photoUrl}&t=${Date.now()}`
        : `${photoUrl}?t=${Date.now()}`;

    photoPreview.src = urlWithTimestamp;
    photoPreview.style.display = 'block';
    photoPlaceholder.style.display = 'none';
    deleteBtn.style.display = 'inline-flex';
}

/**
 * Load experiences section
 */
async function loadExperiences() {
    const experiences = await getExperiences(currentUser.id);
    const list = document.getElementById('experiencesList');
    const empty = document.getElementById('experiencesEmpty');

    list.innerHTML = '';

    // Setup add button (must be done before early return)
    document.getElementById('addExperienceBtn').onclick = () => {
        showExperienceModal();
    };

    if (experiences.length === 0) {
        empty.hidden = false;
        list.hidden = true;
        return;
    }

    empty.hidden = true;
    list.hidden = false;

    experiences.forEach(exp => {
        const item = createExperienceItem(exp);
        list.appendChild(item);
    });
}

/**
 * Create experience list item (bilingual display)
 */
function createExperienceItem(exp) {
    const li = document.createElement('li');
    li.className = 'data-item exp-bilingual';

    const periode = exp.en_cours ?
        `${formatDate(exp.periode_debut)} - Présent` :
        `${formatDate(exp.periode_debut)} - ${formatDate(exp.periode_fin)}`;

    const periodeEn = exp.en_cours ?
        `${formatDate(exp.periode_debut)} - Present` :
        `${formatDate(exp.periode_debut)} - ${formatDate(exp.periode_fin)}`;

    li.innerHTML = `
        <div class="exp-header">
            <div class="exp-date-badge">${periode}</div>
            <div class="data-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="editExperience('${exp.id}')">✏️ Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="removeExperience('${exp.id}')">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="exp-content">
            <div class="exp-lang-column">
                <div class="lang-label">🇫🇷 Français</div>
                <div class="exp-title">${exp.titre || '<em>Non renseigné</em>'}</div>
                <div class="exp-company">${exp.entreprise || '<em>Non renseigné</em>'}</div>
                ${exp.description ? `<div class="exp-description">${exp.description}</div>` : '<div class="exp-description"><em>Pas de description</em></div>'}
                ${exp.competences && exp.competences.length > 0 ?
                    `<div class="exp-skills">
                        ${exp.competences.map(comp => `<span class="badge badge-info">${comp}</span>`).join('')}
                    </div>`
                    : ''}
            </div>
            <div class="exp-lang-column">
                <div class="lang-label">🇬🇧 English</div>
                <div class="exp-title">${exp.titre_en || '<em style="color: var(--text-tertiary);">Not provided</em>'}</div>
                <div class="exp-company">${exp.entreprise_en || '<em style="color: var(--text-tertiary);">Not provided</em>'}</div>
                ${exp.description_en ? `<div class="exp-description">${exp.description_en}</div>` : '<div class="exp-description"><em style="color: var(--text-tertiary);">No description</em></div>'}
                ${exp.competences && exp.competences.length > 0 ?
                    `<div class="exp-skills">
                        ${exp.competences.map(comp => `<span class="badge badge-info">${comp}</span>`).join('')}
                    </div>`
                    : ''}
            </div>
        </div>
    `;

    return li;
}

/**
 * Load formations section
 */
async function loadFormations() {
    const formations = await getFormations(currentUser.id);
    const list = document.getElementById('formationsList');
    const empty = document.getElementById('formationsEmpty');

    list.innerHTML = '';

    // Setup add button (must be done before early return)
    document.getElementById('addFormationBtn').onclick = () => {
        showFormationModal();
    };

    if (formations.length === 0) {
        empty.hidden = false;
        list.hidden = true;
        return;
    }

    empty.hidden = true;
    list.hidden = false;

    formations.forEach(formation => {
        const item = createFormationItem(formation);
        list.appendChild(item);
    });
}

/**
 * Create formation list item (bilingual display)
 */
function createFormationItem(formation) {
    const li = document.createElement('li');
    li.className = 'data-item exp-bilingual';

    const annees = formation.annee_debut && formation.annee_fin ?
        `${formation.annee_debut} - ${formation.annee_fin}` :
        formation.annee_debut || '';

    li.innerHTML = `
        <div class="exp-header">
            <div class="exp-date-badge">${annees || 'Date non spécifiée'}</div>
            <div class="data-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="editFormation('${formation.id}')">✏️ Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="removeFormation('${formation.id}')">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="exp-content">
            <div class="exp-lang-column">
                <div class="lang-label">🇫🇷 Français</div>
                <div class="exp-title">${formation.diplome || '<em>Non renseigné</em>'}</div>
                <div class="exp-company">${formation.institution || '<em>Non renseigné</em>'}</div>
                ${formation.description ? `<div class="exp-description">${formation.description}</div>` : ''}
            </div>
            <div class="exp-lang-column">
                <div class="lang-label">🇬🇧 English</div>
                <div class="exp-title">${formation.diplome_en || '<em>Not specified</em>'}</div>
                <div class="exp-company">${formation.institution_en || '<em>Not specified</em>'}</div>
                ${formation.description_en ? `<div class="exp-description">${formation.description_en}</div>` : ''}
            </div>
        </div>
    `;

    return li;
}

/**
 * Load competences section (bilingual display)
 */
async function loadCompetences() {
    const competences = await getCompetences(currentUser.id);
    const list = document.getElementById('competencesList');
    const empty = document.getElementById('competencesEmpty');

    list.innerHTML = '';

    // Setup add button (must be done before early return)
    document.getElementById('addCompetenceBtn').onclick = () => {
        showCompetenceModal();
    };

    if (competences.length === 0) {
        empty.hidden = false;
        list.hidden = true;
        return;
    }

    empty.hidden = true;
    list.hidden = false;

    // Group by category
    const grouped = competences.reduce((acc, comp) => {
        if (!acc[comp.categorie]) {
            acc[comp.categorie] = [];
        }
        acc[comp.categorie].push(comp);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([categorie, comps]) => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'data-item exp-bilingual';

        categoryItem.innerHTML = `
            <div class="exp-header">
                <div class="exp-date-badge">${categorie}</div>
            </div>
            <div class="exp-content">
                <div class="exp-lang-column">
                    <div class="lang-label">🇫🇷 Français</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                        ${comps.map(comp => `
                            <span class="badge badge-info" style="cursor: pointer;" onclick="editCompetence('${comp.id}')">
                                ${comp.competence || '<em>Non renseigné</em>'} ${comp.niveau ? '• ' + comp.niveau : ''}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="exp-lang-column">
                    <div class="lang-label">🇬🇧 English</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                        ${comps.map(comp => `
                            <span class="badge badge-info" style="cursor: pointer;" onclick="editCompetence('${comp.id}')">
                                ${comp.competence_en || '<em>Not specified</em>'} ${comp.niveau_en ? '• ' + comp.niveau_en : ''}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(categoryItem);
    });
}

/**
 * Load settings section
 */
async function loadSettings() {
    const form = document.getElementById('settingsForm');

    if (currentProfile) {
        document.getElementById('slug').value = currentProfile.slug || '';
        document.getElementById('cvUrl').textContent = `${window.location.origin}/${currentProfile.slug}`;
    }

    // Load formspree_id from cv_info
    const cvInfo = await getCVInfo(currentUser.id);
    if (cvInfo && cvInfo.formspree_id) {
        document.getElementById('formspree_id').value = cvInfo.formspree_id;
    }

    // Setup theme selector
    setupThemeSelector(currentUser.id);

    // Load and display current theme
    const currentTheme = currentProfile?.theme || 'purple-gradient';
    applyTheme(currentTheme);

    // Setup form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formspree_id = document.getElementById('formspree_id').value;

        try {
            await upsertCVInfo(currentUser.id, { formspree_id });
            showToast('Paramètres sauvegardés avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.hidden = false;

    setTimeout(() => {
        toast.hidden = true;
    }, 3000);
}

/**
 * Format date for display
 * Utilise les méthodes UTC pour éviter les problèmes de fuseau horaire
 */
function formatDate(dateString) {
    if (!dateString) return '';

    // Parser la date manuellement pour éviter les problèmes de fuseau horaire
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0
        const day = parseInt(parts[2], 10);

        // Créer une date locale (pas UTC)
        const date = new Date(year, month, day);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    }

    // Fallback pour les autres formats
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
}

/**
 * Modal helpers (simplified versions - to be expanded)
 */
function showExperienceModal() {
    // Créer le modal d'ajout
    const modal = createNewExperienceModal();
    document.body.appendChild(modal);

    // Focus sur le premier champ
    setTimeout(() => {
        modal.querySelector('input').focus();
    }, 100);
}

/**
 * Créer le modal d'ajout d'expérience
 */
function createNewExperienceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'experienceModal';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Ajouter une expérience professionnelle</h3>
                <button class="modal-close" onclick="closeExperienceModal()">&times;</button>
            </div>

            <form id="experienceEditForm" class="modal-body">
                <!-- Période -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="exp_periode_debut">Date de début *</label>
                        <input type="date" id="exp_periode_debut" required>
                    </div>
                    <div class="form-group">
                        <label for="exp_periode_fin">Date de fin</label>
                        <input type="date" id="exp_periode_fin">
                    </div>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="exp_en_cours" onchange="toggleEndDate()">
                        <span>Poste actuel (en cours)</span>
                    </label>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="exp_titre">Titre du poste (FR) *</label>
                    <input type="text" id="exp_titre" required placeholder="Ex: Développeur Full Stack">
                </div>

                <div class="form-group">
                    <label for="exp_entreprise">Entreprise (FR) *</label>
                    <input type="text" id="exp_entreprise" required placeholder="Ex: Acme Corporation">
                </div>

                <div class="form-group">
                    <label for="exp_description">Description (FR)</label>
                    <textarea id="exp_description" rows="4" placeholder="Décrivez vos responsabilités et réalisations..."></textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateToEnglish()" id="translateToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="exp_titre_en">Titre du poste (EN)</label>
                    <input type="text" id="exp_titre_en" placeholder="Ex: Full Stack Developer">
                </div>

                <div class="form-group">
                    <label for="exp_entreprise_en">Entreprise (EN)</label>
                    <input type="text" id="exp_entreprise_en" placeholder="Ex: Acme Corporation">
                </div>

                <div class="form-group">
                    <label for="exp_description_en">Description (EN)</label>
                    <textarea id="exp_description_en" rows="4" placeholder="Describe your responsibilities and achievements..."></textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateToFrench()" id="translateToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Compétences (tags) -->
                <div class="form-group">
                    <label for="exp_competences">Compétences / Technologies</label>
                    <div id="exp_tags_container" class="tags-container">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <input type="text" id="exp_new_tag" placeholder="Ex: JavaScript, React, Node.js..." onkeypress="handleTagKeyPress(event)">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addTag()">+ Ajouter</button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="suggestTags()" id="suggestTagsBtn">
                            ✨ Suggérer
                        </button>
                    </div>
                    <small class="help-text">Appuyez sur Entrée ou cliquez sur "Ajouter" pour ajouter un tag</small>

                    <!-- Suggestions container -->
                    <div id="tag_suggestions" style="margin-top: 15px; display: none;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">
                            💡 Suggestions (cliquez pour ajouter):
                        </div>
                        <div id="tag_suggestions_list" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        </div>
                    </div>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeExperienceModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveNewExperience()">
                    💾 Créer l'expérience
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Sauvegarder une nouvelle expérience
 */
async function saveNewExperience() {
    try {
        // Récupérer tous les tags
        const tagElements = document.querySelectorAll('#exp_tags_container .tag-item');
        const competences = Array.from(tagElements).map(el => {
            return el.textContent.replace('×', '').trim();
        });

        // Construire l'objet expérience
        const experience = {
            titre: document.getElementById('exp_titre').value.trim(),
            entreprise: document.getElementById('exp_entreprise').value.trim(),
            description: document.getElementById('exp_description').value.trim() || null,
            titre_en: document.getElementById('exp_titre_en').value.trim() || null,
            entreprise_en: document.getElementById('exp_entreprise_en').value.trim() || null,
            description_en: document.getElementById('exp_description_en').value.trim() || null,
            periode_debut: document.getElementById('exp_periode_debut').value,
            periode_fin: document.getElementById('exp_en_cours').checked ? null : document.getElementById('exp_periode_fin').value || null,
            en_cours: document.getElementById('exp_en_cours').checked,
            competences: competences.length > 0 ? competences : null,
            ordre: 0 // Par défaut, mettre en première position
        };

        // Validation
        if (!experience.titre || !experience.entreprise || !experience.periode_debut) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (!experience.en_cours && !experience.periode_fin) {
            showToast('Veuillez spécifier une date de fin ou cocher "Poste actuel"', 'error');
            return;
        }

        // Créer l'expérience
        await createExperience(currentUser.id, experience);

        // Fermer le modal
        closeExperienceModal();

        // Recharger la liste
        await loadExperiences();

        showToast('Expérience créée avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la création: ' + error.message, 'error');
    }
}

/**
 * Traduire les champs français vers l'anglais
 */
async function translateToEnglish() {
    try {
        // Récupérer les valeurs françaises
        const titre = document.getElementById('exp_titre').value.trim();
        const entreprise = document.getElementById('exp_entreprise').value.trim();
        const description = document.getElementById('exp_description').value.trim();

        // Validation
        if (!titre && !entreprise && !description) {
            showToast('Veuillez remplir au moins un champ français avant de traduire', 'error');
            return;
        }

        // Désactiver le bouton pendant la traduction
        const button = document.getElementById('translateToEnBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        // Appeler l'API de traduction
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: titre,
                    entreprise: entreprise,
                    description: description
                },
                targetLanguage: 'en'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        // Remplir les champs anglais
        if (translation.titre) {
            document.getElementById('exp_titre_en').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('exp_entreprise_en').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('exp_description_en').value = translation.description;
        }

        showToast('Traduction réussie vers l\'anglais', 'success');

        // Réactiver le bouton
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        // Réactiver le bouton
        const button = document.getElementById('translateToEnBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇬🇧 Traduire vers l\'anglais';
        }
    }
}

/**
 * Traduire les champs anglais vers le français
 */
async function translateToFrench() {
    try {
        // Récupérer les valeurs anglaises
        const titre = document.getElementById('exp_titre_en').value.trim();
        const entreprise = document.getElementById('exp_entreprise_en').value.trim();
        const description = document.getElementById('exp_description_en').value.trim();

        // Validation
        if (!titre && !entreprise && !description) {
            showToast('Veuillez remplir au moins un champ anglais avant de traduire', 'error');
            return;
        }

        // Désactiver le bouton pendant la traduction
        const button = document.getElementById('translateToFrBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        // Appeler l'API de traduction
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: titre,
                    entreprise: entreprise,
                    description: description
                },
                targetLanguage: 'fr'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        // Remplir les champs français
        if (translation.titre) {
            document.getElementById('exp_titre').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('exp_entreprise').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('exp_description').value = translation.description;
        }

        showToast('Traduction réussie vers le français', 'success');

        // Réactiver le bouton
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        // Réactiver le bouton
        const button = document.getElementById('translateToFrBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇫🇷 Traduire vers le français';
        }
    }
}

async function editExperience(id) {
    try {
        // Récupérer l'expérience à modifier
        const experiences = await getExperiences(currentUser.id);
        const exp = experiences.find(e => e.id === id);

        if (!exp) {
            showToast('Expérience non trouvée', 'error');
            return;
        }

        // Créer le modal
        const modal = createExperienceModal(exp);
        document.body.appendChild(modal);

        // Focus sur le premier champ
        setTimeout(() => {
            modal.querySelector('input').focus();
        }, 100);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement de l\'expérience', 'error');
    }
}

/**
 * Créer le modal de modification d'expérience
 */
function createExperienceModal(exp) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'experienceModal';

    // Formater les dates pour input[type="date"]
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Modifier l'expérience professionnelle</h3>
                <button class="modal-close" onclick="closeExperienceModal()">&times;</button>
            </div>

            <form id="experienceEditForm" class="modal-body">
                <!-- Période -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="exp_periode_debut">Date de début *</label>
                        <input type="date" id="exp_periode_debut" required value="${formatDateForInput(exp.periode_debut)}">
                    </div>
                    <div class="form-group">
                        <label for="exp_periode_fin">Date de fin</label>
                        <input type="date" id="exp_periode_fin" ${exp.en_cours ? 'disabled' : ''} value="${exp.en_cours ? '' : formatDateForInput(exp.periode_fin)}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="exp_en_cours" ${exp.en_cours ? 'checked' : ''} onchange="toggleEndDate()">
                        <span>Poste actuel (en cours)</span>
                    </label>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="exp_titre">Titre du poste (FR) *</label>
                    <input type="text" id="exp_titre" required placeholder="Ex: Développeur Full Stack" value="${exp.titre || ''}">
                </div>

                <div class="form-group">
                    <label for="exp_entreprise">Entreprise (FR) *</label>
                    <input type="text" id="exp_entreprise" required placeholder="Ex: Acme Corporation" value="${exp.entreprise || ''}">
                </div>

                <div class="form-group">
                    <label for="exp_description">Description (FR)</label>
                    <textarea id="exp_description" rows="4" placeholder="Décrivez vos responsabilités et réalisations...">${exp.description || ''}</textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateToEnglish()" id="translateToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="exp_titre_en">Titre du poste (EN)</label>
                    <input type="text" id="exp_titre_en" placeholder="Ex: Full Stack Developer" value="${exp.titre_en || ''}">
                </div>

                <div class="form-group">
                    <label for="exp_entreprise_en">Entreprise (EN)</label>
                    <input type="text" id="exp_entreprise_en" placeholder="Ex: Acme Corporation" value="${exp.entreprise_en || ''}">
                </div>

                <div class="form-group">
                    <label for="exp_description_en">Description (EN)</label>
                    <textarea id="exp_description_en" rows="4" placeholder="Describe your responsibilities and achievements...">${exp.description_en || ''}</textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateToFrench()" id="translateToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Compétences (tags) -->
                <div class="form-group">
                    <label for="exp_competences">Compétences / Technologies</label>
                    <div id="exp_tags_container" class="tags-container">
                        ${exp.competences && exp.competences.length > 0 ?
                            exp.competences.map(tag => `
                                <span class="tag-item">
                                    ${tag}
                                    <button type="button" class="tag-remove" onclick="removeTag(this)">×</button>
                                </span>
                            `).join('') : ''}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <input type="text" id="exp_new_tag" placeholder="Ex: JavaScript, React, Node.js..." onkeypress="handleTagKeyPress(event)">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addTag()">+ Ajouter</button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="suggestTags()" id="suggestTagsBtn">
                            ✨ Suggérer
                        </button>
                    </div>
                    <small class="help-text">Appuyez sur Entrée ou cliquez sur "Ajouter" pour ajouter un tag</small>

                    <!-- Suggestions container -->
                    <div id="tag_suggestions" style="margin-top: 15px; display: none;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">
                            💡 Suggestions (cliquez pour ajouter):
                        </div>
                        <div id="tag_suggestions_list" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        </div>
                    </div>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeExperienceModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveExperience('${exp.id}')">
                    💾 Enregistrer
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Fermer le modal d'expérience
 */
function closeExperienceModal() {
    const modal = document.getElementById('experienceModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Toggle date de fin selon "en cours"
 */
function toggleEndDate() {
    const enCours = document.getElementById('exp_en_cours').checked;
    const dateFin = document.getElementById('exp_periode_fin');

    dateFin.disabled = enCours;
    if (enCours) {
        dateFin.value = '';
    }
}

/**
 * Ajouter un tag
 */
function addTag() {
    const input = document.getElementById('exp_new_tag');
    const tag = input.value.trim();

    if (!tag) return;

    const container = document.getElementById('exp_tags_container');
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tag}
        <button type="button" class="tag-remove" onclick="removeTag(this)">×</button>
    `;

    container.appendChild(tagElement);
    input.value = '';
    input.focus();
}

/**
 * Supprimer un tag
 */
function removeTag(button) {
    button.parentElement.remove();
}

/**
 * Gérer la touche Entrée pour ajouter un tag
 */
function handleTagKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTag();
    }
}

/**
 * Suggérer des tags basés sur la description
 */
async function suggestTags() {
    try {
        // Récupérer les descriptions (FR et/ou EN)
        const descriptionFr = document.getElementById('exp_description').value.trim();
        const descriptionEn = document.getElementById('exp_description_en').value.trim();

        // Combiner les descriptions disponibles
        const combinedDescription = [descriptionFr, descriptionEn].filter(d => d).join('\n\n');

        // Validation
        if (!combinedDescription) {
            showToast('Veuillez remplir au moins une description avant de suggérer des tags', 'error');
            return;
        }

        // Récupérer les tags existants
        const tagElements = document.querySelectorAll('#exp_tags_container .tag-item');
        const existingTags = Array.from(tagElements).map(el => {
            return el.textContent.replace('×', '').trim();
        });

        // Désactiver le bouton pendant le chargement
        const button = document.getElementById('suggestTagsBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Analyse...';

        // Appeler l'API de suggestions
        const response = await fetch('/api/suggest-tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: combinedDescription,
                existingTags: existingTags
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la suggestion');
        }

        const data = await response.json();
        const suggestions = data.suggestions || [];

        // Afficher les suggestions
        if (suggestions.length === 0) {
            showToast('Aucune nouvelle suggestion trouvée', 'info');
        } else {
            displayTagSuggestions(suggestions);
            showToast(`${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} trouvée${suggestions.length > 1 ? 's' : ''}`, 'success');
        }

        // Réactiver le bouton
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de suggestion:', error);
        showToast('Erreur: ' + error.message, 'error');

        // Réactiver le bouton
        const button = document.getElementById('suggestTagsBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '✨ Suggérer';
        }
    }
}

/**
 * Afficher les suggestions de tags
 */
function displayTagSuggestions(suggestions) {
    const container = document.getElementById('tag_suggestions');
    const list = document.getElementById('tag_suggestions_list');

    if (!container || !list) return;

    // Vider les suggestions précédentes
    list.innerHTML = '';

    // Créer les badges de suggestions
    suggestions.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'tag-suggestion';
        badge.textContent = tag;
        badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            background: var(--success-color);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        `;
        badge.onmouseover = () => {
            badge.style.background = 'var(--primary-color)';
        };
        badge.onmouseout = () => {
            badge.style.background = 'var(--success-color)';
        };
        badge.onclick = () => addSuggestedTag(tag, badge);

        list.appendChild(badge);
    });

    // Afficher le container
    container.style.display = 'block';
}

/**
 * Ajouter un tag suggéré
 */
function addSuggestedTag(tag, badgeElement) {
    // Vérifier si le tag n'existe pas déjà
    const tagElements = document.querySelectorAll('#exp_tags_container .tag-item');
    const existingTags = Array.from(tagElements).map(el => {
        return el.textContent.replace('×', '').trim().toLowerCase();
    });

    if (existingTags.includes(tag.toLowerCase())) {
        showToast('Ce tag existe déjà', 'info');
        return;
    }

    // Ajouter le tag au container
    const container = document.getElementById('exp_tags_container');
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tag}
        <button type="button" class="tag-remove" onclick="removeTag(this)">×</button>
    `;

    container.appendChild(tagElement);

    // Retirer la suggestion de la liste
    if (badgeElement) {
        badgeElement.remove();
    }

    // Masquer le container de suggestions si vide
    const list = document.getElementById('tag_suggestions_list');
    if (list && list.children.length === 0) {
        const suggestionsContainer = document.getElementById('tag_suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    showToast(`Tag "${tag}" ajouté`, 'success');
}

/**
 * Sauvegarder l'expérience modifiée
 */
async function saveExperience(id) {
    try {
        // Récupérer tous les tags
        const tagElements = document.querySelectorAll('#exp_tags_container .tag-item');
        const competences = Array.from(tagElements).map(el => {
            return el.textContent.replace('×', '').trim();
        });

        // Construire l'objet expérience
        const experience = {
            titre: document.getElementById('exp_titre').value.trim(),
            entreprise: document.getElementById('exp_entreprise').value.trim(),
            description: document.getElementById('exp_description').value.trim(),
            titre_en: document.getElementById('exp_titre_en').value.trim() || null,
            entreprise_en: document.getElementById('exp_entreprise_en').value.trim() || null,
            description_en: document.getElementById('exp_description_en').value.trim() || null,
            periode_debut: document.getElementById('exp_periode_debut').value,
            periode_fin: document.getElementById('exp_en_cours').checked ? null : document.getElementById('exp_periode_fin').value,
            en_cours: document.getElementById('exp_en_cours').checked,
            competences: competences.length > 0 ? competences : null
        };

        // Validation
        if (!experience.titre || !experience.entreprise || !experience.periode_debut) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (!experience.en_cours && !experience.periode_fin) {
            showToast('Veuillez spécifier une date de fin ou cocher "Poste actuel"', 'error');
            return;
        }

        // Sauvegarder
        await updateExperience(id, experience);

        // Fermer le modal
        closeExperienceModal();

        // Recharger la liste
        await loadExperiences();

        showToast('Expérience mise à jour avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

async function removeExperience(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette expérience?')) {
        try {
            await deleteExperience(id);
            await loadExperiences();
            showToast('Expérience supprimée', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    }
}

/**
 * Afficher le modal d'ajout de formation
 */
function showFormationModal() {
    // Créer le modal d'ajout
    const modal = createNewFormationModal();
    document.body.appendChild(modal);

    // Focus sur le premier champ
    setTimeout(() => {
        modal.querySelector('input').focus();
    }, 100);
}

/**
 * Créer le modal d'ajout de formation
 */
function createNewFormationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'formationModal';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Ajouter une formation</h3>
                <button class="modal-close" onclick="closeFormationModal()">&times;</button>
            </div>

            <form id="formationEditForm" class="modal-body">
                <!-- Période -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="form_annee_debut">Année de début</label>
                        <input type="text" id="form_annee_debut" placeholder="Ex: 2018">
                    </div>
                    <div class="form-group">
                        <label for="form_annee_fin">Année de fin</label>
                        <input type="text" id="form_annee_fin" placeholder="Ex: 2020">
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="form_diplome">Diplôme (FR) *</label>
                    <input type="text" id="form_diplome" required placeholder="Ex: Master en Informatique">
                </div>

                <div class="form-group">
                    <label for="form_institution">Institution (FR) *</label>
                    <input type="text" id="form_institution" required placeholder="Ex: Université de Montréal">
                </div>

                <div class="form-group">
                    <label for="form_description">Description (FR)</label>
                    <textarea id="form_description" rows="3" placeholder="Description optionnelle de la formation..."></textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateFormationToEnglish()" id="translateFormToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="form_diplome_en">Diplôme (EN)</label>
                    <input type="text" id="form_diplome_en" placeholder="Ex: Master's Degree in Computer Science">
                </div>

                <div class="form-group">
                    <label for="form_institution_en">Institution (EN)</label>
                    <input type="text" id="form_institution_en" placeholder="Ex: University of Montreal">
                </div>

                <div class="form-group">
                    <label for="form_description_en">Description (EN)</label>
                    <textarea id="form_description_en" rows="3" placeholder="Optional description of the education..."></textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateFormationToFrench()" id="translateFormToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeFormationModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveNewFormation()">
                    💾 Créer la formation
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Sauvegarder une nouvelle formation
 */
async function saveNewFormation() {
    try {
        // Construire l'objet formation
        const formation = {
            diplome: document.getElementById('form_diplome').value.trim(),
            institution: document.getElementById('form_institution').value.trim(),
            description: document.getElementById('form_description').value.trim() || null,
            diplome_en: document.getElementById('form_diplome_en').value.trim() || null,
            institution_en: document.getElementById('form_institution_en').value.trim() || null,
            description_en: document.getElementById('form_description_en').value.trim() || null,
            annee_debut: document.getElementById('form_annee_debut').value.trim() || null,
            annee_fin: document.getElementById('form_annee_fin').value.trim() || null,
            ordre: 0 // Par défaut, mettre en première position
        };

        // Validation
        if (!formation.diplome || !formation.institution) {
            showToast('Veuillez remplir tous les champs obligatoires (Diplôme et Institution)', 'error');
            return;
        }

        // Créer la formation
        await createFormation(currentUser.id, formation);

        // Fermer le modal
        closeFormationModal();

        // Recharger la liste
        await loadFormations();

        showToast('Formation créée avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la création: ' + error.message, 'error');
    }
}

/**
 * Modifier une formation existante
 */
async function editFormation(id) {
    try {
        // Récupérer la formation à modifier
        const formations = await getFormations(currentUser.id);
        const formation = formations.find(f => f.id === id);

        if (!formation) {
            showToast('Formation non trouvée', 'error');
            return;
        }

        // Créer le modal
        const modal = createFormationModal(formation);
        document.body.appendChild(modal);

        // Focus sur le premier champ
        setTimeout(() => {
            modal.querySelector('input').focus();
        }, 100);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement de la formation', 'error');
    }
}

/**
 * Créer le modal de modification de formation
 */
function createFormationModal(formation) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'formationModal';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Modifier la formation</h3>
                <button class="modal-close" onclick="closeFormationModal()">&times;</button>
            </div>

            <form id="formationEditForm" class="modal-body">
                <!-- Période -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="form_annee_debut">Année de début</label>
                        <input type="text" id="form_annee_debut" placeholder="Ex: 2018" value="${formation.annee_debut || ''}">
                    </div>
                    <div class="form-group">
                        <label for="form_annee_fin">Année de fin</label>
                        <input type="text" id="form_annee_fin" placeholder="Ex: 2020" value="${formation.annee_fin || ''}">
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="form_diplome">Diplôme (FR) *</label>
                    <input type="text" id="form_diplome" required placeholder="Ex: Master en Informatique" value="${formation.diplome || ''}">
                </div>

                <div class="form-group">
                    <label for="form_institution">Institution (FR) *</label>
                    <input type="text" id="form_institution" required placeholder="Ex: Université de Montréal" value="${formation.institution || ''}">
                </div>

                <div class="form-group">
                    <label for="form_description">Description (FR)</label>
                    <textarea id="form_description" rows="3" placeholder="Description optionnelle de la formation...">${formation.description || ''}</textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateFormationToEnglish()" id="translateFormToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="form_diplome_en">Diplôme (EN)</label>
                    <input type="text" id="form_diplome_en" placeholder="Ex: Master's Degree in Computer Science" value="${formation.diplome_en || ''}">
                </div>

                <div class="form-group">
                    <label for="form_institution_en">Institution (EN)</label>
                    <input type="text" id="form_institution_en" placeholder="Ex: University of Montreal" value="${formation.institution_en || ''}">
                </div>

                <div class="form-group">
                    <label for="form_description_en">Description (EN)</label>
                    <textarea id="form_description_en" rows="3" placeholder="Optional description of the education...">${formation.description_en || ''}</textarea>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateFormationToFrench()" id="translateFormToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeFormationModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveFormation('${formation.id}')">
                    💾 Enregistrer
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Fermer le modal de formation
 */
function closeFormationModal() {
    const modal = document.getElementById('formationModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Sauvegarder la formation modifiée
 */
async function saveFormation(id) {
    try {
        // Construire l'objet formation
        const formation = {
            diplome: document.getElementById('form_diplome').value.trim(),
            institution: document.getElementById('form_institution').value.trim(),
            description: document.getElementById('form_description').value.trim() || null,
            diplome_en: document.getElementById('form_diplome_en').value.trim() || null,
            institution_en: document.getElementById('form_institution_en').value.trim() || null,
            description_en: document.getElementById('form_description_en').value.trim() || null,
            annee_debut: document.getElementById('form_annee_debut').value.trim() || null,
            annee_fin: document.getElementById('form_annee_fin').value.trim() || null
        };

        // Validation
        if (!formation.diplome || !formation.institution) {
            showToast('Veuillez remplir tous les champs obligatoires (Diplôme et Institution)', 'error');
            return;
        }

        // Sauvegarder
        await updateFormation(id, formation);

        // Fermer le modal
        closeFormationModal();

        // Recharger la liste
        await loadFormations();

        showToast('Formation mise à jour avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

/**
 * Traduire les champs français vers l'anglais (formations)
 */
async function translateFormationToEnglish() {
    try {
        // Récupérer les valeurs françaises
        const diplome = document.getElementById('form_diplome').value.trim();
        const institution = document.getElementById('form_institution').value.trim();
        const description = document.getElementById('form_description').value.trim();

        // Validation
        if (!diplome && !institution && !description) {
            showToast('Veuillez remplir au moins un champ français avant de traduire', 'error');
            return;
        }

        // Désactiver le bouton pendant la traduction
        const button = document.getElementById('translateFormToEnBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        // Appeler l'API de traduction
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: diplome,
                    entreprise: institution,
                    description: description
                },
                targetLanguage: 'en'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        // Remplir les champs anglais
        if (translation.titre) {
            document.getElementById('form_diplome_en').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('form_institution_en').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('form_description_en').value = translation.description;
        }

        showToast('Traduction réussie vers l\'anglais', 'success');

        // Réactiver le bouton
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        // Réactiver le bouton
        const button = document.getElementById('translateFormToEnBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇬🇧 Traduire vers l\'anglais';
        }
    }
}

/**
 * Traduire les champs anglais vers le français (formations)
 */
async function translateFormationToFrench() {
    try {
        // Récupérer les valeurs anglaises
        const diplome = document.getElementById('form_diplome_en').value.trim();
        const institution = document.getElementById('form_institution_en').value.trim();
        const description = document.getElementById('form_description_en').value.trim();

        // Validation
        if (!diplome && !institution && !description) {
            showToast('Veuillez remplir au moins un champ anglais avant de traduire', 'error');
            return;
        }

        // Désactiver le bouton pendant la traduction
        const button = document.getElementById('translateFormToFrBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        // Appeler l'API de traduction
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: diplome,
                    entreprise: institution,
                    description: description
                },
                targetLanguage: 'fr'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        // Remplir les champs français
        if (translation.titre) {
            document.getElementById('form_diplome').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('form_institution').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('form_description').value = translation.description;
        }

        showToast('Traduction réussie vers le français', 'success');

        // Réactiver le bouton
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        // Réactiver le bouton
        const button = document.getElementById('translateFormToFrBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇫🇷 Traduire vers le français';
        }
    }
}

async function removeFormation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation?')) {
        try {
            await deleteFormation(id);
            await loadFormations();
            showToast('Formation supprimée', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression', 'error');
        }
    }
}

/**
 * Afficher le modal d'ajout de compétence
 */
function showCompetenceModal() {
    const modal = createNewCompetenceModal();
    document.body.appendChild(modal);

    setTimeout(() => {
        modal.querySelector('input').focus();
    }, 100);
}

/**
 * Créer le modal d'ajout de compétence
 */
function createNewCompetenceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'competenceModal';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Ajouter une compétence</h3>
                <button class="modal-close" onclick="closeCompetenceModal()">&times;</button>
            </div>

            <form id="competenceEditForm" class="modal-body">
                <!-- Catégorie (français) -->
                <div class="form-group">
                    <label for="comp_categorie">Catégorie (FR) *</label>
                    <input type="text" id="comp_categorie" required placeholder="Ex: Langages de programmation">
                    <small class="help-text">Ex: Langages de programmation, Frameworks, Outils, etc.</small>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="comp_competence">Compétence (FR) *</label>
                    <input type="text" id="comp_competence" required placeholder="Ex: JavaScript">
                </div>

                <div class="form-group">
                    <label for="comp_niveau">Niveau (FR)</label>
                    <select id="comp_niveau">
                        <option value="">-- Aucun --</option>
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Expert">Expert</option>
                    </select>
                    <small class="help-text">Niveau de maîtrise de cette compétence</small>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateCompetenceToEnglish()" id="translateCompToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="comp_categorie_en">Catégorie (EN)</label>
                    <input type="text" id="comp_categorie_en" placeholder="Ex: Programming Languages">
                </div>

                <div class="form-group">
                    <label for="comp_competence_en">Compétence (EN)</label>
                    <input type="text" id="comp_competence_en" placeholder="Ex: JavaScript">
                </div>

                <div class="form-group">
                    <label for="comp_niveau_en">Niveau (EN)</label>
                    <select id="comp_niveau_en">
                        <option value="">-- None --</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
                    <small class="help-text">Skill proficiency level</small>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateCompetenceToFrench()" id="translateCompToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeCompetenceModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveNewCompetence()">
                    💾 Créer la compétence
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Sauvegarder une nouvelle compétence
 */
async function saveNewCompetence() {
    try {
        const competence = {
            categorie: document.getElementById('comp_categorie').value.trim(),
            competence: document.getElementById('comp_competence').value.trim(),
            niveau: document.getElementById('comp_niveau').value.trim() || null,
            categorie_en: document.getElementById('comp_categorie_en').value.trim() || null,
            competence_en: document.getElementById('comp_competence_en').value.trim() || null,
            niveau_en: document.getElementById('comp_niveau_en').value.trim() || null,
            ordre: 0
        };

        if (!competence.categorie || !competence.competence) {
            showToast('Veuillez remplir tous les champs obligatoires (Catégorie et Compétence)', 'error');
            return;
        }

        await createCompetence(currentUser.id, competence);
        closeCompetenceModal();
        await loadCompetences();
        showToast('Compétence créée avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la création: ' + error.message, 'error');
    }
}

/**
 * Modifier une compétence existante
 */
async function editCompetence(id) {
    try {
        const competences = await getCompetences(currentUser.id);
        const competence = competences.find(c => c.id === id);

        if (!competence) {
            showToast('Compétence non trouvée', 'error');
            return;
        }

        const modal = createCompetenceModal(competence);
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.querySelector('input').focus();
        }, 100);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement de la compétence', 'error');
    }
}

/**
 * Créer le modal de modification de compétence
 */
function createCompetenceModal(competence) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'competenceModal';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>Modifier la compétence</h3>
                <button class="modal-close" onclick="closeCompetenceModal()">&times;</button>
            </div>

            <form id="competenceEditForm" class="modal-body">
                <!-- Catégorie (français) -->
                <div class="form-group">
                    <label for="comp_categorie">Catégorie (FR) *</label>
                    <input type="text" id="comp_categorie" required placeholder="Ex: Langages de programmation" value="${competence.categorie || ''}">
                    <small class="help-text">Ex: Langages de programmation, Frameworks, Outils, etc.</small>
                </div>

                <div class="divider"></div>

                <!-- Version française -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇫🇷 Version française</h4>

                <div class="form-group">
                    <label for="comp_competence">Compétence (FR) *</label>
                    <input type="text" id="comp_competence" required placeholder="Ex: JavaScript" value="${competence.competence || ''}">
                </div>

                <div class="form-group">
                    <label for="comp_niveau">Niveau (FR)</label>
                    <select id="comp_niveau">
                        <option value="" ${!competence.niveau ? 'selected' : ''}>-- Aucun --</option>
                        <option value="Débutant" ${competence.niveau === 'Débutant' ? 'selected' : ''}>Débutant</option>
                        <option value="Intermédiaire" ${competence.niveau === 'Intermédiaire' ? 'selected' : ''}>Intermédiaire</option>
                        <option value="Avancé" ${competence.niveau === 'Avancé' ? 'selected' : ''}>Avancé</option>
                        <option value="Expert" ${competence.niveau === 'Expert' ? 'selected' : ''}>Expert</option>
                    </select>
                    <small class="help-text">Niveau de maîtrise de cette compétence</small>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateCompetenceToEnglish()" id="translateCompToEnBtn">
                        🇬🇧 Traduire vers l'anglais
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Version anglaise -->
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">🇬🇧 Version anglaise</h4>

                <div class="form-group">
                    <label for="comp_categorie_en">Catégorie (EN)</label>
                    <input type="text" id="comp_categorie_en" placeholder="Ex: Programming Languages" value="${competence.categorie_en || ''}">
                </div>

                <div class="form-group">
                    <label for="comp_competence_en">Compétence (EN)</label>
                    <input type="text" id="comp_competence_en" placeholder="Ex: JavaScript" value="${competence.competence_en || ''}">
                </div>

                <div class="form-group">
                    <label for="comp_niveau_en">Niveau (EN)</label>
                    <select id="comp_niveau_en">
                        <option value="" ${!competence.niveau_en ? 'selected' : ''}>-- None --</option>
                        <option value="Beginner" ${competence.niveau_en === 'Beginner' ? 'selected' : ''}>Beginner</option>
                        <option value="Intermediate" ${competence.niveau_en === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                        <option value="Advanced" ${competence.niveau_en === 'Advanced' ? 'selected' : ''}>Advanced</option>
                        <option value="Expert" ${competence.niveau_en === 'Expert' ? 'selected' : ''}>Expert</option>
                    </select>
                    <small class="help-text">Skill proficiency level</small>
                </div>

                <div style="margin-top: 15px; margin-bottom: 15px; text-align: center;">
                    <button type="button" class="btn btn-secondary" onclick="translateCompetenceToFrench()" id="translateCompToFrBtn">
                        🇫🇷 Traduire vers le français
                    </button>
                </div>

                <div class="divider"></div>

                <!-- Zone de suppression -->
                <div style="margin-top: 20px; padding: 15px; background: var(--bg-tertiary); border-radius: var(--border-radius); border-left: 4px solid var(--danger-color);">
                    <h4 style="margin: 0 0 10px 0; color: var(--danger-color); font-size: 14px;">Zone de danger</h4>
                    <button type="button" class="btn btn-danger" onclick="removeCompetenceFromModal('${competence.id}')">
                        🗑️ Supprimer cette compétence
                    </button>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeCompetenceModal()">Annuler</button>
                <button type="button" class="btn btn-success" onclick="saveCompetence('${competence.id}')">
                    💾 Enregistrer
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Fermer le modal de compétence
 */
function closeCompetenceModal() {
    const modal = document.getElementById('competenceModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Sauvegarder la compétence modifiée
 */
async function saveCompetence(id) {
    try {
        const competence = {
            categorie: document.getElementById('comp_categorie').value.trim(),
            competence: document.getElementById('comp_competence').value.trim(),
            niveau: document.getElementById('comp_niveau').value.trim() || null,
            categorie_en: document.getElementById('comp_categorie_en').value.trim() || null,
            competence_en: document.getElementById('comp_competence_en').value.trim() || null,
            niveau_en: document.getElementById('comp_niveau_en').value.trim() || null
        };

        if (!competence.categorie || !competence.competence) {
            showToast('Veuillez remplir tous les champs obligatoires (Catégorie et Compétence)', 'error');
            return;
        }

        await updateCompetence(id, competence);
        closeCompetenceModal();
        await loadCompetences();
        showToast('Compétence mise à jour avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

/**
 * Traduire les champs français vers l'anglais (compétences)
 */
async function translateCompetenceToEnglish() {
    try {
        const categorie = document.getElementById('comp_categorie').value.trim();
        const competence = document.getElementById('comp_competence').value.trim();
        const niveau = document.getElementById('comp_niveau').value.trim();

        if (!categorie && !competence && !niveau) {
            showToast('Veuillez remplir au moins un champ français avant de traduire', 'error');
            return;
        }

        const button = document.getElementById('translateCompToEnBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: categorie,
                    entreprise: competence,
                    description: niveau
                },
                targetLanguage: 'en'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        if (translation.titre) {
            document.getElementById('comp_categorie_en').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('comp_competence_en').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('comp_niveau_en').value = translation.description;
        }

        showToast('Traduction réussie vers l\'anglais', 'success');
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        const button = document.getElementById('translateCompToEnBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇬🇧 Traduire vers l\'anglais';
        }
    }
}

/**
 * Traduire les champs anglais vers le français (compétences)
 */
async function translateCompetenceToFrench() {
    try {
        const categorie = document.getElementById('comp_categorie_en').value.trim();
        const competence = document.getElementById('comp_competence_en').value.trim();
        const niveau = document.getElementById('comp_niveau_en').value.trim();

        if (!categorie && !competence && !niveau) {
            showToast('Veuillez remplir au moins un champ anglais avant de traduire', 'error');
            return;
        }

        const button = document.getElementById('translateCompToFrBtn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ Traduction en cours...';

        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: {
                    titre: categorie,
                    entreprise: competence,
                    description: niveau
                },
                targetLanguage: 'fr'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la traduction');
        }

        const data = await response.json();
        const translation = data.translation;

        if (translation.titre) {
            document.getElementById('comp_categorie').value = translation.titre;
        }
        if (translation.entreprise) {
            document.getElementById('comp_competence').value = translation.entreprise;
        }
        if (translation.description) {
            document.getElementById('comp_niveau').value = translation.description;
        }

        showToast('Traduction réussie vers le français', 'success');
        button.disabled = false;
        button.innerHTML = originalText;

    } catch (error) {
        console.error('Erreur de traduction:', error);
        showToast('Erreur: ' + error.message, 'error');

        const button = document.getElementById('translateCompToFrBtn');
        if (button) {
            button.disabled = false;
            button.innerHTML = '🇫🇷 Traduire vers le français';
        }
    }
}

/**
 * Supprimer une compétence depuis le modal
 */
async function removeCompetenceFromModal(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence?')) {
        try {
            await deleteCompetence(id);
            closeCompetenceModal();
            await loadCompetences();
            showToast('Compétence supprimée', 'success');
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    }
}
