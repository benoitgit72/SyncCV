// ============================================
// Honest Fit Assessment - Frontend Logic
// ============================================

// Global state
let currentFitResults = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initFitAssessment();
});

/**
 * Initialize Fit Assessment Modal
 */
function initFitAssessment() {
    const modal = document.getElementById('fitAssessmentModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.fit-modal-close');
    const overlay = modal.querySelector('.fit-modal-overlay');
    const analyzeBtn = document.getElementById('analyzeFitBtn');
    const textarea = document.getElementById('jobDescription');
    const copyBtn = document.getElementById('copyResultsBtn');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    const retryBtn = document.getElementById('retryAnalysisBtn');

    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeFitModal);
    if (overlay) overlay.addEventListener('click', closeFitModal);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeFit);
    if (textarea) {
        textarea.addEventListener('input', updateCharCount);
        textarea.addEventListener('paste', () => setTimeout(updateCharCount, 10));
        textarea.addEventListener('change', updateCharCount);
    }
    if (copyBtn) copyBtn.addEventListener('click', copyResults);
    if (newAnalysisBtn) newAnalysisBtn.addEventListener('click', newAnalysis);
    if (retryBtn) retryBtn.addEventListener('click', retryAnalysis);

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) {
            closeFitModal();
        }
    });

    console.log('✅ Fit Assessment initialized');
}

/**
 * Open Fit Assessment Modal
 */
function openFitModal() {
    const modal = document.getElementById('fitAssessmentModal');
    if (!modal) return;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Reset state
    resetFitModal();

    // Focus on textarea
    setTimeout(() => {
        const textarea = document.getElementById('jobDescription');
        if (textarea) textarea.focus();
    }, 100);

    console.log('📊 Fit Assessment modal opened');
}

/**
 * Close Fit Assessment Modal
 */
function closeFitModal() {
    const modal = document.getElementById('fitAssessmentModal');
    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = '';

    console.log('📊 Fit Assessment modal closed');
}

/**
 * Reset Modal State
 */
function resetFitModal() {
    // Reset textarea
    const textarea = document.getElementById('jobDescription');
    if (textarea) {
        textarea.value = '';
        updateCharCount();
    }

    // Hide all states
    document.getElementById('fitLoadingState').hidden = true;
    document.getElementById('fitResults').hidden = true;
    document.getElementById('fitErrorState').hidden = true;

    // Show input section
    const inputSection = document.querySelector('.fit-input-section');
    if (inputSection) inputSection.style.display = 'block';

    // Reset results
    currentFitResults = null;
}

/**
 * Update Character Count
 */
function updateCharCount() {
    const textarea = document.getElementById('jobDescription');
    const charCount = document.getElementById('charCount');
    const analyzeBtn = document.getElementById('analyzeFitBtn');

    if (!textarea || !charCount || !analyzeBtn) return;

    const count = textarea.value.length;
    charCount.textContent = count;

    // Enable/disable button
    analyzeBtn.disabled = count < 50; // Minimum 50 characters
}

/**
 * Get Current Language
 */
function getCurrentLanguage() {
    return document.documentElement.lang || 'fr';
}

/**
 * Get User ID from URL slug
 */
function getUserIdFromSlug() {
    const slug = window.location.pathname.split('/').filter(s => s.length > 0)[0];
    return slug || null;
}

/**
 * Analyze Fit (Main Function)
 */
async function analyzeFit() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const currentLanguage = getCurrentLanguage();
    const slug = getUserIdFromSlug();

    if (!jobDescription || jobDescription.length < 50) {
        showError(translations[currentLanguage].fit_error_empty || 'Veuillez coller une description de poste');
        return;
    }

    if (!slug) {
        showError('Impossible de déterminer le CV à analyser');
        return;
    }

    // Show loading state
    showLoadingState();

    try {
        const response = await fetch('/api/fit-assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slug: slug,
                jobDescription: jobDescription,
                language: currentLanguage
            })
        });

        if (!response.ok) {
            const error = await response.json();

            // Handle rate limit
            if (response.status === 429) {
                const hours = error.hoursRemaining || 24;
                const message = (translations[currentLanguage].fit_error_rate_limit || 'Limite atteinte')
                    .replace('{hours}', hours);
                throw new Error(message);
            }

            throw new Error(error.message || error.error || 'Erreur d\'analyse');
        }

        const data = await response.json();

        if (!data.success || !data.analysis) {
            throw new Error('Réponse invalide du serveur');
        }

        // Store results
        currentFitResults = data.analysis;

        // Display results
        displayResults(data.analysis);

        // Update remaining count
        if (data.remainingAnalyses !== undefined) {
            updateRemainingCount(data.remainingAnalyses);
        }

        console.log('✅ Analysis completed successfully');

    } catch (error) {
        console.error('❌ Analysis error:', error);
        showError(error.message);
    }
}

/**
 * Show Loading State
 */
function showLoadingState() {
    // Hide input section
    const inputSection = document.querySelector('.fit-input-section');
    if (inputSection) inputSection.style.display = 'none';

    // Hide other states
    document.getElementById('fitResults').hidden = true;
    document.getElementById('fitErrorState').hidden = true;

    // Show loading
    document.getElementById('fitLoadingState').hidden = false;
}

/**
 * Hide Loading State
 */
function hideLoadingState() {
    document.getElementById('fitLoadingState').hidden = true;
}

/**
 * Display Results
 */
function displayResults(analysis) {
    hideLoadingState();

    const resultsDiv = document.getElementById('fitResults');
    resultsDiv.hidden = false;

    // Overall Score
    const scoreValue = document.querySelector('.fit-score-value');
    if (scoreValue) {
        scoreValue.textContent = analysis.overallScore + '%';
    }

    // Strong Fit
    const strongList = document.getElementById('strongFitList');
    if (strongList && analysis.strongFit) {
        strongList.innerHTML = analysis.strongFit.map(item =>
            `<li>${escapeHtml(item)}</li>`
        ).join('');
    }

    const strongSummary = document.getElementById('strongFitSummary');
    if (strongSummary && analysis.strongFitSummary) {
        strongSummary.textContent = analysis.strongFitSummary;
    }

    // Areas for Development
    const devList = document.getElementById('developmentList');
    if (devList && analysis.areasForDevelopment) {
        devList.innerHTML = analysis.areasForDevelopment.map(item =>
            `<li>${escapeHtml(item)}</li>`
        ).join('');
    }

    const devSummary = document.getElementById('developmentSummary');
    if (devSummary && analysis.developmentSummary) {
        devSummary.textContent = analysis.developmentSummary;
    }

    // Recommendations
    const recList = document.getElementById('recommendationsList');
    if (recList && analysis.recommendations) {
        recList.innerHTML = analysis.recommendations.map(item =>
            `<li>${escapeHtml(item)}</li>`
        ).join('');
    }

    // Scroll to results
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Show Error
 */
function showError(message) {
    hideLoadingState();

    // Show input section again
    const inputSection = document.querySelector('.fit-input-section');
    if (inputSection) inputSection.style.display = 'block';

    // Show error state
    const errorDiv = document.getElementById('fitErrorState');
    const errorMessage = document.getElementById('fitErrorMessage');
    const retryBtn = document.getElementById('retryAnalysisBtn');

    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.hidden = false;

        // Show retry button for rate limit errors
        if (retryBtn) {
            retryBtn.hidden = !message.includes('limite') && !message.includes('limit');
        }
    }
}

/**
 * Update Remaining Count
 */
function updateRemainingCount(count) {
    const remainingText = document.getElementById('remainingCountText');
    if (!remainingText) return;

    const currentLanguage = getCurrentLanguage();
    const template = translations[currentLanguage].fit_remaining || '{count} analyses restantes';
    const text = template.replace('{count}', count);

    remainingText.textContent = text;
}

/**
 * Copy Results to Clipboard
 */
function copyResults() {
    if (!currentFitResults) return;

    const currentLanguage = getCurrentLanguage();
    const text = formatResultsForCopy(currentFitResults, currentLanguage);

    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const message = translations[currentLanguage].fit_copied_success || 'Résultats copiés!';
        showToastMessage(message);
        console.log('📋 Results copied to clipboard');
    }).catch(err => {
        console.error('❌ Failed to copy:', err);
        showToastMessage('Erreur lors de la copie');
    });
}

/**
 * Format Results for Copy
 */
function formatResultsForCopy(analysis, lang) {
    const t = translations[lang];
    let text = '';

    // Title
    text += `${t.fit_assessment_title}\n`;
    text += '='.repeat(50) + '\n\n';

    // Overall Score
    text += `${t.fit_overall_score}: ${analysis.overallScore}%\n\n`;

    // Strong Fit
    text += `✅ ${t.fit_strong_title}:\n`;
    analysis.strongFit.forEach(item => {
        text += `  • ${item}\n`;
    });
    text += `\nRésumé: ${analysis.strongFitSummary}\n\n`;

    // Areas for Development
    text += `⚠️ ${t.fit_development_title}:\n`;
    analysis.areasForDevelopment.forEach(item => {
        text += `  • ${item}\n`;
    });
    text += `\nRésumé: ${analysis.developmentSummary}\n\n`;

    // Recommendations
    text += `💡 ${t.fit_recommendations_title}:\n`;
    analysis.recommendations.forEach(item => {
        text += `  • ${item}\n`;
    });

    return text;
}

/**
 * New Analysis
 */
function newAnalysis() {
    resetFitModal();

    // Focus on textarea
    setTimeout(() => {
        const textarea = document.getElementById('jobDescription');
        if (textarea) textarea.focus();
    }, 100);
}

/**
 * Retry Analysis
 */
function retryAnalysis() {
    // Hide error
    document.getElementById('fitErrorState').hidden = true;

    // Retry
    analyzeFit();
}

/**
 * Show Toast Message
 */
function showToastMessage(message) {
    // Check if global toast function exists
    if (typeof showToast === 'function') {
        showToast(message, 'success');
        return;
    }

    // Fallback: simple alert
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10001;
        font-size: 14px;
        animation: slideInUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export function for use in other scripts
window.openFitModal = openFitModal;

console.log('✅ Fit Assessment module loaded');
