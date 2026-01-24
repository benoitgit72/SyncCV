// ============================================
// More Options Menu & PDF Download
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMoreOptionsMenu();
    initPdfDownload();
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
 * Generate and download PDF of the CV
 */
async function generatePDF() {
    // Show loading indicator
    showLoadingOverlay();

    try {
        // Get the current name from the hero section
        const nameElement = document.querySelector('.hero-title .name');
        const cvName = nameElement ? nameElement.textContent.trim() : 'CV';
        const fileName = `${cvName.replace(/\s+/g, '_')}_CV.pdf`;

        // Clone the body to modify it for PDF
        const element = document.body.cloneNode(true);

        // Remove elements that shouldn't be in the PDF
        const elementsToRemove = [
            '.navbar',
            '.chatbot-container',
            '.back-to-top',
            '.scroll-indicator',
            '.more-options-menu',
            '#loadingOverlay'
        ];

        elementsToRemove.forEach(selector => {
            const els = element.querySelectorAll(selector);
            els.forEach(el => el.remove());
        });

        // Collapse all achievement lists (show only titles)
        const achievementLists = element.querySelectorAll('.achievement-list');
        achievementLists.forEach(list => {
            list.remove();
        });

        // Remove toggle buttons
        const toggleButtons = element.querySelectorAll('.experience-toggle');
        toggleButtons.forEach(btn => btn.remove());

        // Adjust styles for PDF
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body {
                background: white !important;
            }
            .hero {
                padding: 60px 20px !important;
                min-height: auto !important;
            }
            .section {
                page-break-inside: avoid;
                padding: 40px 20px !important;
            }
            .timeline-item {
                page-break-inside: avoid;
            }
            .skill-category {
                page-break-inside: avoid;
            }
            .education-card {
                page-break-inside: avoid;
            }
            .contact-section {
                display: none !important;
            }
            .footer {
                padding: 20px !important;
            }
        `;
        element.insertBefore(style, element.firstChild);

        // PDF options
        const opt = {
            margin: [10, 10, 10, 10],
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.section'
            }
        };

        // Generate PDF
        await html2pdf().set(opt).from(element).save();

        hideLoadingOverlay();
        showSuccessMessage('PDF téléchargé avec succès!');
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        hideLoadingOverlay();
        showErrorMessage('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
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
