// ============================================
// More Options Menu & PDF Download
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMoreOptionsMenu();
    initPdfDownload();
    initFitAssessmentMenuItem();
});

/**
 * Initialize the more options menu
 */
function initMoreOptionsMenu() {
    const moreBtn = document.getElementById('moreOptionsBtn');
    const moreMenu = document.getElementById('moreOptionsMenu');

    if (!moreBtn || !moreMenu) return;

    // Toggle menu on button click
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            closeMoreOptionsMenu();
        } else {
            openMoreOptionsMenu();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!moreMenu.contains(e.target) && !moreBtn.contains(e.target)) {
            closeMoreOptionsMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMoreOptionsMenu();
        }
    });
}

/**
 * Open the more options menu
 */
function openMoreOptionsMenu() {
    const moreBtn = document.getElementById('moreOptionsBtn');
    const moreMenu = document.getElementById('moreOptionsMenu');

    moreMenu.hidden = false;
    moreBtn.setAttribute('aria-expanded', 'true');
}

/**
 * Close the more options menu
 */
function closeMoreOptionsMenu() {
    const moreBtn = document.getElementById('moreOptionsBtn');
    const moreMenu = document.getElementById('moreOptionsMenu');

    moreMenu.hidden = true;
    moreBtn.setAttribute('aria-expanded', 'false');
}

/**
 * Initialize PDF download functionality
 */
function initPdfDownload() {
    const downloadBtn = document.getElementById('downloadPdfBtn');

    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', async () => {
        closeMoreOptionsMenu();
        await generatePDF();
    });
}

/**
 * Initialize Fit Assessment menu item
 */
function initFitAssessmentMenuItem() {
    const fitBtn = document.getElementById('fitAssessmentBtn');

    if (!fitBtn) return;

    fitBtn.addEventListener('click', () => {
        closeMoreOptionsMenu();

        // Call the openFitModal function from fit-assessment.js
        if (typeof openFitModal === 'function') {
            openFitModal();
        } else {
            console.error('openFitModal function not found');
        }
    });
}

/**
 * Generate and download PDF of the CV
 */
async function generatePDF() {
    // Show loading indicator
    showLoadingOverlay();

    try {
        // Detect current language
        const currentLang = detectCurrentLanguage();
        console.log('Langue détectée:', currentLang);

        // Get CV data from Supabase
        const cvData = await fetchCVDataFromSupabase();
        console.log('Données CV chargées:', cvData);

        if (!cvData) {
            throw new Error('Impossible de charger les données du CV');
        }

        // Build professional PDF HTML
        const pdfHTML = buildPDFHTML(cvData, currentLang);
        console.log('HTML généré, longueur:', pdfHTML.length);
        console.log('Aperçu HTML:', pdfHTML.substring(0, 500));

        // Create a temporary container - positioned absolutely off-screen but still rendered
        const container = document.createElement('div');
        container.id = 'pdf-temp-container';
        container.innerHTML = pdfHTML;

        // Style: absolute positioning, off-screen but rendered, no height limits
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 794px;
            background: white;
            padding: 40px;
        `;

        document.body.appendChild(container);
        console.log('Conteneur ajouté au DOM');

        // Force browser reflow
        container.offsetHeight;

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Capture du contenu avec html2canvas...');

        // Use html2canvas directly to capture the content
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: container.scrollWidth,
            height: container.scrollHeight
        });

        console.log('Canvas créé, dimensions:', canvas.width, 'x', canvas.height);

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Calculate PDF dimensions (A4 in mm)
        const pdfWidth = 210;
        const pdfHeight = 297;

        // Calculate image dimensions to fit in PDF
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        console.log('Création du PDF avec jsPDF...');

        // Create PDF using jsPDF directly
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let heightLeft = imgHeight;
        let position = 10; // Top margin

        // Add first page
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20); // Subtract page height minus margins

        // Add additional pages if content exceeds one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }

        // Save the PDF
        const fileName = `${cvData.cvInfo.nom.replace(/\s+/g, '_')}_CV.pdf`;
        pdf.save(fileName);

        console.log('PDF généré et téléchargé avec succès');

        // Clean up
        document.body.removeChild(container);

        hideLoadingOverlay();
        showSuccessMessage('PDF téléchargé avec succès!');
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        hideLoadingOverlay();
        showErrorMessage('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
}

/**
 * Detect the current language from the page
 */
function detectCurrentLanguage() {
    const langBtn = document.getElementById('languageToggle');
    if (langBtn) {
        const langText = langBtn.querySelector('.lang-text');
        if (langText && langText.textContent.trim() === 'EN') {
            return 'en';
        }
    }
    return 'fr';
}

/**
 * Fetch CV data from Supabase
 */
async function fetchCVDataFromSupabase() {
    try {
        // Get the slug from URL
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const slug = pathParts[0] || 'default';

        // Load CV data using the existing loader
        const data = await loadCVData();

        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return null;
    }
}

/**
 * Build professional PDF HTML
 */
function buildPDFHTML(data, lang) {
    const isEnglish = lang === 'en';
    const cvInfo = data.cvInfo;
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const competences = data.competences || [];

    console.log('Construction PDF pour:', cvInfo.nom);
    console.log('Expériences:', experiences.length);
    console.log('Formations:', formations.length);
    console.log('Compétences:', competences.length);

    // Build HTML with inline styles - simple and visible
    let html = '<div style="font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #000000; padding: 30px; width: 100%; box-sizing: border-box;">';

    html += buildHeaderSection(cvInfo, isEnglish);
    html += buildAboutSection(cvInfo, isEnglish);
    html += buildExperiencesSection(experiences, isEnglish);
    html += buildFormationsSection(formations, isEnglish);
    html += buildCompetencesSection(competences, isEnglish);
    html += buildFooter(cvInfo, isEnglish);

    html += '</div>';

    return html;
}

/**
 * Build header section
 */
function buildHeaderSection(cvInfo, isEnglish) {
    const contactParts = [];
    if (cvInfo.email) contactParts.push(cvInfo.email);
    if (cvInfo.telephone) contactParts.push(cvInfo.telephone);
    if (cvInfo.linkedin) contactParts.push(cvInfo.linkedin);

    return `
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #1e40af;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">${cvInfo.nom || ''}</h1>
            <div style="color: #000000; font-size: 16px; margin-bottom: 8px; font-weight: normal;">${isEnglish ? (cvInfo.titre_en || cvInfo.titre) : cvInfo.titre}</div>
            ${contactParts.length > 0 ? `<div style="color: #333333; font-size: 12px;">${contactParts.join(' • ')}</div>` : ''}
        </div>
    `;
}

/**
 * Build about section
 */
function buildAboutSection(cvInfo, isEnglish) {
    const bio = isEnglish ? (cvInfo.bio_en || cvInfo.bio) : cvInfo.bio;

    if (!bio) return '';

    return `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #1e40af;">${isEnglish ? 'ABOUT ME' : 'À PROPOS'}</h2>
            <p style="color: #000000; font-size: 12px; line-height: 1.5; margin: 0;">${bio}</p>
        </div>
    `;
}

/**
 * Build experiences section
 */
function buildExperiencesSection(experiences, isEnglish) {
    if (!experiences || experiences.length === 0) return '';

    const experiencesHTML = experiences.map(exp => {
        const titre = isEnglish ? (exp.titre_en || exp.titre) : exp.titre;
        const entreprise = isEnglish ? (exp.entreprise_en || exp.entreprise) : exp.entreprise;
        const description = isEnglish ? (exp.description_en || exp.description) : exp.description;

        const dateDebut = formatDateForPDF(exp.periode_debut);
        const dateFin = exp.en_cours ? (isEnglish ? 'Present' : 'Présent') : formatDateForPDF(exp.periode_fin);

        return `
            <div style="margin-bottom: 15px;">
                <div style="color: #1e40af; font-size: 11px; font-weight: bold; margin-bottom: 3px;">${dateDebut} - ${dateFin}</div>
                <div style="color: #000000; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${titre}</div>
                <div style="color: #333333; font-size: 12px; font-weight: normal; margin-bottom: 5px;">${entreprise}</div>
                ${description ? `<div style="color: #000000; font-size: 11px; line-height: 1.4; margin-bottom: 5px;">${description}</div>` : ''}
                ${exp.competences && exp.competences.length > 0 ? `
                    <div style="margin-top: 5px;">
                        ${exp.competences.map(comp => `<span style="display: inline-block; background: #e0e7ff; color: #1e40af; padding: 2px 8px; border-radius: 3px; font-size: 10px; margin-right: 4px; margin-bottom: 4px;">${comp}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #1e40af;">${isEnglish ? 'PROFESSIONAL EXPERIENCE' : 'EXPÉRIENCE PROFESSIONNELLE'}</h2>
            ${experiencesHTML}
        </div>
    `;
}

/**
 * Build formations section
 */
function buildFormationsSection(formations, isEnglish) {
    if (!formations || formations.length === 0) return '';

    const formationsHTML = formations.map(formation => {
        const diplome = isEnglish ? (formation.diplome_en || formation.diplome) : formation.diplome;
        const institution = isEnglish ? (formation.institution_en || formation.institution) : formation.institution;
        const description = isEnglish ? (formation.description_en || formation.description) : formation.description;

        const annees = formation.annee_debut && formation.annee_fin
            ? `${formation.annee_debut} - ${formation.annee_fin}`
            : formation.annee_debut || '';

        return `
            <div style="margin-bottom: 15px;">
                ${annees ? `<div style="color: #1e40af; font-size: 11px; font-weight: bold; margin-bottom: 3px;">${annees}</div>` : ''}
                <div style="color: #000000; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${diplome}</div>
                <div style="color: #333333; font-size: 12px; font-weight: normal; margin-bottom: 5px;">${institution}</div>
                ${description ? `<div style="color: #000000; font-size: 11px; line-height: 1.4;">${description}</div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #1e40af;">${isEnglish ? 'EDUCATION' : 'FORMATION'}</h2>
            ${formationsHTML}
        </div>
    `;
}

/**
 * Build competences section
 */
function buildCompetencesSection(competences, isEnglish) {
    if (!competences || competences.length === 0) return '';

    // Group by category
    const grouped = competences.reduce((acc, comp) => {
        const categorie = isEnglish ? (comp.categorie_en || comp.categorie) : comp.categorie;
        if (!acc[categorie]) {
            acc[categorie] = [];
        }
        acc[categorie].push(comp);
        return acc;
    }, {});

    const categoriesHTML = Object.entries(grouped).map(([categorie, comps]) => {
        const competencesHTML = comps.map(comp => {
            const nom = isEnglish ? (comp.competence_en || comp.competence) : comp.competence;
            const niveau = isEnglish ? comp.niveau_en : comp.niveau;
            return `<span style="display: inline-block; background: #e0e7ff; color: #1e40af; padding: 2px 8px; border-radius: 3px; font-size: 10px; margin-right: 4px; margin-bottom: 4px;">${nom}${niveau ? ' • ' + niveau : ''}</span>`;
        }).join('');

        return `
            <div style="margin-bottom: 10px;">
                <div style="color: #000000; font-size: 12px; font-weight: bold; margin-bottom: 5px;">${categorie}</div>
                <div style="line-height: 1.6;">
                    ${competencesHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #1e40af;">${isEnglish ? 'SKILLS' : 'COMPÉTENCES'}</h2>
            ${categoriesHTML}
        </div>
    `;
}

/**
 * Build footer
 */
function buildFooter(cvInfo, isEnglish) {
    return `
        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #cccccc; color: #666666; font-size: 10px;">
            ${isEnglish ? 'Generated with' : 'Généré avec'} SyncCV • ${new Date().getFullYear()}
        </div>
    `;
}

/**
 * Format date for PDF
 */
function formatDateForPDF(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const month = date.toLocaleDateString('fr-FR', { month: 'long' });
    const year = date.getFullYear();

    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
    // Remove existing overlay if any
    hideLoadingOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>Génération du PDF en cours...</p>
            <small>Cela peut prendre quelques secondes</small>
        </div>
    `;
    document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    showToast(message, 'success');
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    showToast(message, 'error');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
