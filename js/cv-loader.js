// ============================================
// Chargement dynamique des données du CV depuis Supabase
// ============================================

// Slug du CV à charger (par défaut : ron-more)
const CV_SLUG = 'ron-more';

// Cache des données pour éviter les rechargements
// Rendre accessible globalement pour le chatbot
let cvData = null;
window.cvData = null;

/**
 * Charge toutes les données du CV depuis Supabase
 */
async function loadCVData(slug = CV_SLUG) {
    try {
        console.log(`📥 Chargement des données du CV pour le slug: ${slug}`);

        // Obtenir le client Supabase
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        // 1. Récupérer le profil par slug
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, slug, template_id')
            .eq('slug', slug)
            .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error(`Profil non trouvé pour le slug: ${slug}`);

        const userId = profile.id;
        console.log(`✅ Profil trouvé (ID: ${userId})`);

        // 2. Charger les informations personnelles
        const { data: cvInfo, error: cvInfoError } = await supabase
            .from('cv_info')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (cvInfoError) throw cvInfoError;

        // 3. Charger les expériences (triées par ordre)
        const { data: experiences, error: experiencesError } = await supabase
            .from('experiences')
            .select('*')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (experiencesError) throw experiencesError;

        // 4. Charger les formations (triées par ordre)
        const { data: formations, error: formationsError } = await supabase
            .from('formations')
            .select('*')
            .eq('user_id', userId)
            .order('ordre', { ascending: true });

        if (formationsError) throw formationsError;

        // 5. Charger les compétences (triées par catégorie et ordre)
        const { data: competences, error: competencesError } = await supabase
            .from('competences')
            .select('*')
            .eq('user_id', userId)
            .order('categorie', { ascending: true })
            .order('ordre', { ascending: true });

        if (competencesError) throw competencesError;

        // 6. Regrouper les compétences par catégorie
        const competencesParCategorie = competences.reduce((acc, comp) => {
            if (!acc[comp.categorie]) {
                acc[comp.categorie] = [];
            }
            acc[comp.categorie].push(comp);
            return acc;
        }, {});

        // Assembler toutes les données
        cvData = {
            profile,
            cvInfo,
            experiences,
            formations,
            competences,
            competencesParCategorie
        };

        // Rendre accessible globalement pour le chatbot
        window.cvData = cvData;

        console.log('✅ Données du CV chargées:', cvData);
        return cvData;

    } catch (error) {
        console.error('❌ Erreur lors du chargement du CV:', error);
        throw error;
    }
}

/**
 * Formatte une date au format français
 */
function formatDate(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Formatte une période (date début - date fin)
 */
function formatPeriod(periodeDebut, periodeFin, enCours = false) {
    const debut = formatDate(periodeDebut);

    if (enCours) {
        return `${debut} - Présent`;
    }

    if (!periodeFin) {
        return debut;
    }

    const fin = formatDate(periodeFin);
    return `${debut} - ${fin}`;
}

/**
 * Calcule le pourcentage pour les barres de compétences
 */
function getNiveauPercentage(niveau) {
    const niveaux = {
        'Débutant': 40,
        'Intermédiaire': 60,
        'Avancé': 80,
        'Expert': 95
    };
    return niveaux[niveau] || 50;
}

/**
 * Rend le CV avec les données chargées
 */
async function renderCV() {
    try {
        // Charger les données
        const data = await loadCVData();

        // Rendre chaque section
        renderHeroSection(data.cvInfo);
        renderAboutSection(data.cvInfo);
        renderExperiencesSection(data.experiences);
        renderFormationsSection(data.formations);
        renderCompetencesSection(data.competencesParCategorie);

        console.log('✅ CV rendu avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du rendu du CV:', error);
        showError('Impossible de charger le CV. Veuillez réessayer plus tard.');
    }
}

/**
 * Affiche une erreur à l'utilisateur
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 15px 20px; border-radius: 5px; z-index: 10000;';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Rend la section Hero
 */
function renderHeroSection(cvInfo) {
    // Mettre à jour le nom
    const nameElement = document.querySelector('.hero-title .name');
    if (nameElement) {
        nameElement.textContent = cvInfo.nom;
    }

    // Mettre à jour le titre
    const subtitleElement = document.querySelector('.hero-subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = cvInfo.titre;
    }

    // Mettre à jour la photo (si disponible)
    if (cvInfo.photo_url) {
        const photoElement = document.querySelector('.profile-photo');
        if (photoElement) {
            photoElement.src = cvInfo.photo_url;
            photoElement.alt = `${cvInfo.nom} - Photo de profil`;
        }
    }
}

/**
 * Rend la section À propos
 */
function renderAboutSection(cvInfo) {
    const bioElement = document.querySelector('.about-text .lead');
    if (bioElement && cvInfo.bio) {
        bioElement.textContent = cvInfo.bio;
    }

    // Mettre à jour le lien LinkedIn (si disponible)
    if (cvInfo.linkedin) {
        const linkedinLink = document.querySelector('.social-links a[href*="linkedin"]');
        if (linkedinLink) {
            linkedinLink.href = cvInfo.linkedin;
        }
    }
}

/**
 * Rend la section Expériences
 */
function renderExperiencesSection(experiences) {
    const timelineContainer = document.querySelector('.timeline');
    if (!timelineContainer) return;

    // Vider le contenu actuel
    timelineContainer.innerHTML = '';

    // Créer chaque élément de timeline
    experiences.forEach((exp, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.setAttribute('data-aos', 'fade-up');
        if (index > 0) {
            timelineItem.setAttribute('data-aos-delay', (index * 50).toString());
        }

        const periode = formatPeriod(exp.periode_debut, exp.periode_fin, exp.en_cours);

        timelineItem.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <span class="timeline-date">${periode}</span>
                <h3>${exp.titre}</h3>
                <h4>${exp.entreprise}</h4>
                <p>${exp.description ? exp.description.split('\n\n')[0] : ''}</p>
                ${exp.description && exp.description.includes('Réalisations:') ? `
                <button class="experience-toggle" aria-expanded="false" aria-label="Afficher les détails">
                    <span class="toggle-icon">›</span>
                    <span class="toggle-text">Afficher les détails</span>
                </button>
                <ul class="achievement-list" hidden>
                    ${exp.description.split('Réalisations:\n')[1] ?
                        exp.description.split('Réalisations:\n')[1]
                            .split('\n')
                            .filter(line => line.trim().startsWith('•'))
                            .map(line => `<li>${line.trim().substring(1).trim()}</li>`)
                            .join('')
                        : ''}
                </ul>
                ` : ''}
            </div>
        `;

        timelineContainer.appendChild(timelineItem);
    });

    // Réattacher les événements pour les toggles
    attachExperienceToggles();
}

/**
 * Rend la section Formations
 */
function renderFormationsSection(formations) {
    const educationGrid = document.querySelector('.education-grid');
    if (!educationGrid) return;

    // Vider le contenu actuel
    educationGrid.innerHTML = '';

    formations.forEach((formation, index) => {
        const card = document.createElement('div');
        card.className = 'education-card';
        card.setAttribute('data-aos', 'fade-up');
        if (index > 0) {
            card.setAttribute('data-aos-delay', (index * 100).toString());
        }

        const annees = formation.annee_debut && formation.annee_fin
            ? `${formation.annee_debut} - ${formation.annee_fin}`
            : '';

        // Formater la description en liste
        const descriptionLines = formation.description ?
            formation.description.split('\n').filter(line => line.trim()) : [];

        card.innerHTML = `
            <div class="education-icon">🎓</div>
            <h3>${formation.diplome}</h3>
            ${formation.institution ? `<h4>${formation.institution}</h4>` : ''}
            ${annees ? `<p class="education-years">${annees}</p>` : ''}
            ${descriptionLines.length > 0 ? `
                <ul class="certification-list">
                    ${descriptionLines.map(line => `<li>${line}</li>`).join('')}
                </ul>
            ` : ''}
        `;

        educationGrid.appendChild(card);
    });
}

/**
 * Rend la section Compétences
 */
function renderCompetencesSection(competencesParCategorie) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    // Vider le contenu actuel
    skillsGrid.innerHTML = '';

    let delay = 0;
    Object.entries(competencesParCategorie).forEach(([categorie, competences]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category';
        categoryDiv.setAttribute('data-aos', 'fade-up');
        categoryDiv.setAttribute('data-aos-delay', delay.toString());
        delay += 100;

        categoryDiv.innerHTML = `
            <h3>${categorie}</h3>
            <div class="skill-items">
                ${competences.map(comp => {
                    const percentage = getNiveauPercentage(comp.niveau);
                    return `
                        <div class="skill-item">
                            <div class="skill-info">
                                <span>${comp.competence}</span>
                                <span class="skill-percent">${percentage}%</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-progress" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        skillsGrid.appendChild(categoryDiv);
    });
}

/**
 * Attache les événements pour les toggles d'expérience
 */
function attachExperienceToggles() {
    const toggleButtons = document.querySelectorAll('.experience-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const achievementList = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            this.setAttribute('aria-expanded', !isExpanded);
            achievementList.hidden = isExpanded;

            const toggleText = this.querySelector('.toggle-text');
            const toggleIcon = this.querySelector('.toggle-icon');

            if (isExpanded) {
                toggleText.textContent = 'Afficher les détails';
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                toggleText.textContent = 'Masquer les détails';
                toggleIcon.style.transform = 'rotate(90deg)';
            }
        });
    });
}

// Initialiser le CV au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du chargement du CV...');

    // Attendre un peu pour s'assurer que Supabase est chargé
    setTimeout(() => {
        renderCV();
    }, 100);
});
