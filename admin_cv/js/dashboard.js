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

    // Setup navigation
    setupNavigation();

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
        'personal-info': 'Informations personnelles',
        'experiences': 'Expériences professionnelles',
        'formations': 'Formations et certifications',
        'competences': 'Compétences techniques',
        'settings': 'Paramètres du compte'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionName];

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

    // Setup add button
    document.getElementById('addExperienceBtn').onclick = () => {
        showExperienceModal();
    };
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
                <button class="btn btn-danger btn-sm" onclick="removeExperience('${exp.id}')">🗑️</button>
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

    // Setup add button
    document.getElementById('addFormationBtn').onclick = () => {
        showFormationModal();
    };
}

/**
 * Create formation list item
 */
function createFormationItem(formation) {
    const li = document.createElement('li');
    li.className = 'data-item';

    const annees = formation.annee_debut && formation.annee_fin ?
        `${formation.annee_debut} - ${formation.annee_fin}` :
        formation.annee_debut || '';

    li.innerHTML = `
        <div class="data-item-header">
            <div>
                <div class="data-item-title">${formation.diplome}</div>
                <div class="data-item-meta">${formation.institution} ${annees ? '• ' + annees : ''}</div>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="editFormation('${formation.id}')">✏️ Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="removeFormation('${formation.id}')">🗑️</button>
            </div>
        </div>
    `;

    return li;
}

/**
 * Load competences section
 */
async function loadCompetences() {
    const competences = await getCompetences(currentUser.id);
    const list = document.getElementById('competencesList');
    const empty = document.getElementById('competencesEmpty');

    list.innerHTML = '';

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
        categoryItem.className = 'data-item';
        categoryItem.innerHTML = `
            <div class="data-item-header">
                <div class="data-item-title">${categorie}</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                ${comps.map(comp => `
                    <span class="badge badge-info" style="cursor: pointer;" onclick="editCompetence('${comp.id}')">
                        ${comp.competence} ${comp.niveau ? '• ' + comp.niveau : ''}
                    </span>
                `).join('')}
            </div>
        `;
        list.appendChild(categoryItem);
    });

    // Setup add button
    document.getElementById('addCompetenceBtn').onclick = () => {
        showCompetenceModal();
    };
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
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
}

/**
 * Modal helpers (simplified versions - to be expanded)
 */
function showExperienceModal() {
    alert('Modal d\'ajout d\'expérience à implémenter. Pour l\'instant, utilisez Supabase Studio.');
}

function editExperience(id) {
    alert(`Modification de l'expérience ${id} à implémenter`);
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

function showFormationModal() {
    alert('Modal d\'ajout de formation à implémenter. Pour l\'instant, utilisez Supabase Studio.');
}

function editFormation(id) {
    alert(`Modification de la formation ${id} à implémenter`);
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

function showCompetenceModal() {
    alert('Modal d\'ajout de compétence à implémenter. Pour l\'instant, utilisez Supabase Studio.');
}

function editCompetence(id) {
    alert(`Modification de la compétence ${id} à implémenter`);
}
