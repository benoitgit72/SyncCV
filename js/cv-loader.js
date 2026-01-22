// ============================================
// Chargement dynamique des données du CV depuis Supabase
// ============================================

/**
 * Extrait le slug depuis l'URL path
 * Exemples:
 *   https://synccv.vercel.app/ron-more → 'ron-more'
 *   https://synccv.vercel.app/benoit-gaulin → 'benoit-gaulin'
 *   https://synccv.vercel.app/ → null (affichera la page d'accueil)
 */
function getSlugFromURL() {
    const path = window.location.pathname;
    const slug = path.split('/').filter(segment => segment.length > 0)[0];

    // Si aucun slug n'est trouvé, retourner null pour afficher la page d'accueil
    return slug || null;
}

/**
 * Redirige vers la page d'accueil si aucun slug n'est fourni
 */
function checkAndRedirectToWelcome() {
    const slug = getSlugFromURL();
    if (!slug) {
        console.log('🏠 Aucun slug détecté, redirection vers la page d\'accueil...');
        window.location.href = '/welcome.html';
        return true;
    }
    return false;
}

// Slug du CV à charger (extrait depuis l'URL)
const CV_SLUG = getSlugFromURL();
console.log(`🔍 Slug détecté depuis l'URL: ${CV_SLUG}`);

// Langue actuelle (par défaut : français)
let currentLanguage = localStorage.getItem('language') || 'fr';

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
 * Formatte une date selon la langue active
 */
function formatDate(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    const locale = currentLanguage === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, options);
}

/**
 * Formatte une période (date début - date fin)
 */
function formatPeriod(periodeDebut, periodeFin, enCours = false) {
    const debut = formatDate(periodeDebut);

    if (enCours) {
        const presentText = currentLanguage === 'en' ? 'Present' : 'Présent';
        return `${debut} - ${presentText}`;
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
        // Français
        'Débutant': 40,
        'Intermédiaire': 60,
        'Avancé': 80,
        'Expert': 95,
        // Anglais
        'Beginner': 40,
        'Intermediate': 60,
        'Advanced': 80,
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
 * Obtient le texte dans la langue active
 */
function getLocalizedText(frenchText, englishText) {
    return currentLanguage === 'en' && englishText ? englishText : frenchText;
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

    // Mettre à jour le titre (avec support bilingue)
    const subtitleElement = document.querySelector('.hero-subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = getLocalizedText(cvInfo.titre, cvInfo.titre_en);
    }

    // Mettre à jour la photo
    const photoElement = document.querySelector('.profile-photo');
    if (photoElement) {
        if (cvInfo.photo_url) {
            // Si une photo est définie, l'afficher
            photoElement.src = cvInfo.photo_url;
            photoElement.alt = `${cvInfo.nom} - Photo de profil`;
            photoElement.style.display = 'block';
        } else {
            // Si pas de photo, cacher l'élément image
            photoElement.style.display = 'none';
        }
    }

    // Mettre à jour tous les éléments contenant le nom
    updateNameThroughout(cvInfo.nom);
}

/**
 * Met à jour le nom du propriétaire du CV partout dans la page
 */
function updateNameThroughout(nom) {
    // Mettre à jour la navigation (nav-brand)
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.textContent = nom;
    }

    // Mettre à jour le meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        const lang = currentLanguage === 'en' ? 'Interactive CV of' : 'CV interactif de';
        metaDescription.setAttribute('content', `${lang} ${nom}`);
    }

    // Mettre à jour le titre de la page
    const pageTitle = document.querySelector('title');
    if (pageTitle) {
        const titleText = currentLanguage === 'en' ? 'Interactive CV' : 'CV Interactif';
        pageTitle.textContent = `${nom} - ${titleText}`;
    }

    // Mettre à jour le placeholder du formulaire de contact
    const messageInput = document.querySelector('#message');
    if (messageInput) {
        const greeting = currentLanguage === 'en' ? 'Hello' : 'Bonjour';
        const text = currentLanguage === 'en'
            ? `${greeting} ${nom.split(' ')[0]}, I would like to discuss with you...`
            : `${greeting} ${nom.split(' ')[0]}, je souhaiterais discuter avec vous...`;
        messageInput.setAttribute('placeholder', text);
    }

    // Mettre à jour le footer
    const footerText = document.querySelector('.footer p');
    if (footerText && footerText.textContent.includes('[prénom nom]')) {
        const year = new Date().getFullYear();
        const rightsText = currentLanguage === 'en' ? 'All rights reserved' : 'Tous droits réservés';
        footerText.textContent = `© ${year} ${nom}. ${rightsText}.`;
    }

    // Mettre à jour le sous-titre du chatbot
    const chatbotSubtitle = document.querySelector('.chatbot-header p');
    if (chatbotSubtitle) {
        const prenom = nom.split(' ')[0];
        const text = currentLanguage === 'en'
            ? `Ask me questions about ${prenom}'s CV`
            : `Posez-moi des questions sur le CV de ${prenom}`;
        chatbotSubtitle.textContent = text;
    }

    // Mettre à jour le message de bienvenue du chatbot
    const welcomeMessage = document.querySelector('.bot-message .message-content');
    if (welcomeMessage && welcomeMessage.textContent.includes('Benoit Gaulin')) {
        if (currentLanguage === 'en') {
            welcomeMessage.textContent = `Hello! I am an AI assistant who can answer your questions about ${nom}'s professional background. Feel free to ask me about their experience, skills or education.`;
        } else {
            welcomeMessage.textContent = `Bonjour! Je suis un assistant IA qui peut répondre à vos questions sur le parcours professionnel de ${nom}. N'hésitez pas à me demander des informations sur son expérience, ses compétences ou sa formation.`;
        }
    }
}

/**
 * Rend la section À propos
 */
function renderAboutSection(cvInfo) {
    const bioElement = document.querySelector('.about-text .lead');
    if (bioElement && cvInfo.bio) {
        bioElement.textContent = getLocalizedText(cvInfo.bio, cvInfo.bio_en);
    }

    // Mettre à jour le lien LinkedIn (si disponible)
    if (cvInfo.linkedin) {
        const linkedinLink = document.querySelector('.social-links a[href*="linkedin"]');
        if (linkedinLink) {
            linkedinLink.href = cvInfo.linkedin;
        }
    }

    // Mettre à jour le formulaire de contact Formspree (si disponible)
    if (cvInfo.formspree_id) {
        const contactForm = document.querySelector('#contactForm');
        if (contactForm) {
            contactForm.setAttribute('action', `https://formspree.io/f/${cvInfo.formspree_id}`);
            console.log(`✅ Formulaire Formspree configuré: ${cvInfo.formspree_id}`);
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

        // Obtenir les textes dans la langue active
        const titre = getLocalizedText(exp.titre, exp.titre_en);
        const entreprise = getLocalizedText(exp.entreprise, exp.entreprise_en);
        const description = getLocalizedText(exp.description, exp.description_en);

        // Déterminer le séparateur de réalisations selon la langue
        const achievementsMarker = currentLanguage === 'en' ? 'Achievements:' : 'Réalisations:';
        const showDetailsText = currentLanguage === 'en' ? 'Show details' : 'Afficher les détails';

        timelineItem.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <span class="timeline-date">${periode}</span>
                <h3>${titre}</h3>
                <h4>${entreprise}</h4>
                <p>${description ? description.split('\n\n')[0] : ''}</p>
                ${description && description.includes(achievementsMarker) ? `
                <button class="experience-toggle" aria-expanded="false" aria-label="${showDetailsText}">
                    <span class="toggle-icon">›</span>
                    <span class="toggle-text">${showDetailsText}</span>
                </button>
                <ul class="achievement-list" hidden>
                    ${description.split(achievementsMarker + '\n')[1] ?
                        description.split(achievementsMarker + '\n')[1]
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

        // Obtenir les textes dans la langue active
        const diplome = getLocalizedText(formation.diplome, formation.diplome_en);
        const institution = getLocalizedText(formation.institution, formation.institution_en);
        const description = getLocalizedText(formation.description, formation.description_en);

        // Formater la description en liste
        const descriptionLines = description ?
            description.split('\n').filter(line => line.trim()) : [];

        card.innerHTML = `
            <div class="education-icon">🎓</div>
            <h3>${diplome}</h3>
            ${institution ? `<h4>${institution}</h4>` : ''}
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

        // Obtenir le nom de catégorie dans la langue active
        const categorieLocalized = currentLanguage === 'en' && competences[0].categorie_en
            ? competences[0].categorie_en
            : categorie;

        categoryDiv.innerHTML = `
            <h3>${categorieLocalized}</h3>
            <div class="skill-items">
                ${competences.map(comp => {
                    const competenceName = getLocalizedText(comp.competence, comp.competence_en);
                    const niveau = getLocalizedText(comp.niveau, comp.niveau_en);
                    const percentage = getNiveauPercentage(niveau);
                    return `
                        <div class="skill-item">
                            <div class="skill-info">
                                <span>${competenceName}</span>
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

            const showText = currentLanguage === 'en' ? 'Show details' : 'Afficher les détails';
            const hideText = currentLanguage === 'en' ? 'Hide details' : 'Masquer les détails';

            if (isExpanded) {
                toggleText.textContent = showText;
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                toggleText.textContent = hideText;
                toggleIcon.style.transform = 'rotate(90deg)';
            }
        });
    });
}

/**
 * Recharge le CV avec la nouvelle langue
 */
function reloadCVWithLanguage(newLanguage) {
    console.log(`🌍 Changement de langue vers: ${newLanguage}`);
    currentLanguage = newLanguage;

    // Mettre à jour le nom dans tous les éléments avec la nouvelle langue
    if (cvData && cvData.cvInfo) {
        updateNameThroughout(cvData.cvInfo.nom);
    }

    // Forcer le rechargement du CV avec la nouvelle langue
    renderCV();
}

// Initialiser le CV au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du chargement du CV...');

    // Vérifier si on doit rediriger vers la page d'accueil
    if (checkAndRedirectToWelcome()) {
        return; // Arrêter l'exécution si redirection en cours
    }

    // Récupérer la langue sauvegardée
    currentLanguage = localStorage.getItem('language') || 'fr';

    // Attendre un peu pour s'assurer que Supabase est chargé
    setTimeout(() => {
        renderCV();
    }, 100);

    // Écouter les changements de langue
    window.addEventListener('languageChanged', (event) => {
        reloadCVWithLanguage(event.detail.lang);
    });
});
