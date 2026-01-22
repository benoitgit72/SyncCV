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
    alert('Modal d\'ajout d\'expérience à implémenter. Pour l\'instant, utilisez Supabase Studio.');
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
                    </div>
                    <small class="help-text">Appuyez sur Entrée ou cliquez sur "Ajouter" pour ajouter un tag</small>
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
