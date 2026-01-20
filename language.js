// Gestion du changement de langue pour le CV de Benoit Gaulin

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'fr';
        this.init();
    }

    init() {
        // Appliquer la langue sauvegardée au chargement
        this.applyLanguage(this.currentLang);

        // Attacher l'événement au bouton de langue
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'fr' ? 'en' : 'fr';
        localStorage.setItem('language', this.currentLang);
        this.applyLanguage(this.currentLang);
    }

    applyLanguage(lang) {
        const t = translations[lang];
        if (!t) return;

        // Mettre à jour l'attribut lang du HTML
        document.documentElement.lang = lang;

        // Mettre à jour le bouton de langue
        const flagIcon = document.querySelector('#languageToggle .flag-icon');
        const langText = document.querySelector('#languageToggle .lang-text');
        if (flagIcon && langText) {
            if (lang === 'fr') {
                flagIcon.textContent = '🇫🇷';
                langText.textContent = 'FR';
            } else {
                flagIcon.textContent = '🇬🇧';
                langText.textContent = 'EN';
            }
        }

        // Navigation
        this.updateTextContent('.nav-link[href="#home"]', t.nav_home);
        this.updateTextContent('.nav-link[href="#about"]', t.nav_about);
        this.updateTextContent('.nav-link[href="#experience"]', t.nav_experience);
        this.updateTextContent('.nav-link[href="#education"]', t.nav_education);
        this.updateTextContent('.nav-link[href="#skills"]', t.nav_skills);
        this.updateTextContent('.nav-link[href="#contact"]', t.nav_contact);

        // Hero Section
        this.updateTextContent('.hero .greeting', t.hero_greeting);
        this.updateTextContent('.hero-subtitle', t.hero_subtitle);
        this.updateTextContent('.hero-buttons .btn-primary', t.hero_btn_contact);
        this.updateTextContent('.hero-buttons .btn-secondary', t.hero_btn_about);

        // About Section
        this.updateTextContent('.about-section .section-title', t.about_title);
        this.updateTextContent('.about-text', t.about_text);

        // Stats
        const stats = document.querySelectorAll('.stat-label');
        if (stats.length >= 3) {
            stats[0].textContent = t.about_years_exp;
            stats[1].textContent = t.about_projects;
            stats[2].textContent = t.about_certifications;
        }

        // Experience Section
        this.updateTextContent('.experience-section .section-title', t.exp_title);

        // Update experience toggle buttons
        const toggleButtons = document.querySelectorAll('.experience-toggle .toggle-text');
        toggleButtons.forEach(btn => {
            const isExpanded = btn.closest('.experience-toggle').getAttribute('aria-expanded') === 'true';
            btn.textContent = isExpanded ? t.exp_hide_details : t.exp_show_details;
        });

        // Update specific job entries
        this.updateExperience(lang, t);

        // Education Section
        this.updateTextContent('.education-section .section-title', t.edu_title);
        this.updateEducation(lang, t);

        // Skills Section
        this.updateTextContent('.skills-section .section-title', t.skills_title);
        this.updateSkills(lang, t);

        // Contact Section
        this.updateTextContent('.contact-section .section-title', t.contact_title);
        this.updateTextContent('.contact-intro', t.contact_subtitle);
        this.updateContact(lang, t);

        // Update chatbot elements
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.placeholder = t.chatbot_placeholder;
        }

        // Update chatbot header title and subtitle
        const chatbotHeader = document.querySelector('.chatbot-header h3');
        if (chatbotHeader) {
            chatbotHeader.textContent = t.chatbot_title;
        }

        const chatbotSubtitle = document.querySelector('.chatbot-header p');
        if (chatbotSubtitle) {
            chatbotSubtitle.textContent = t.chatbot_subtitle;
        }

        // Update chatbot welcome message (first bot message)
        const welcomeMessage = document.querySelector('.bot-message .message-content');
        if (welcomeMessage) {
            welcomeMessage.textContent = t.chatbot_welcome;
        }

        // Émettre un événement personnalisé pour informer le chatbot du changement de langue
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateTextContent(selector, text) {
        const element = document.querySelector(selector);
        if (element && text) {
            element.textContent = text;
        }
    }

    updateExperience(lang, t) {
        const timelineItems = document.querySelectorAll('.timeline-item');

        // Update all 17 job experiences
        for (let i = 0; i < timelineItems.length && i < 17; i++) {
            const item = timelineItems[i];
            const jobNum = i + 1;

            // Update date, title, company, and description
            this.updateElement(item, '.timeline-date', t[`exp${jobNum}_date`]);
            this.updateElement(item, 'h3', t[`exp${jobNum}_title`]);
            this.updateElement(item, 'h4', t[`exp${jobNum}_company`]);
            this.updateElement(item, 'p', t[`exp${jobNum}_desc`]);

            // Update achievements
            const achievements = item.querySelectorAll('.achievement-list li');
            if (achievements.length >= 4) {
                achievements[0].textContent = t[`exp${jobNum}_ach1`];
                achievements[1].textContent = t[`exp${jobNum}_ach2`];
                achievements[2].textContent = t[`exp${jobNum}_ach3`];
                achievements[3].textContent = t[`exp${jobNum}_ach4`];
            }
        }
    }

    updateEducation(lang, t) {
        const eduItems = document.querySelectorAll('.education-card');

        // Card 1: Bachelor's Degree
        if (eduItems[0]) {
            this.updateElement(eduItems[0], '.education-degree', t.edu1_degree);
            this.updateElement(eduItems[0], '.education-school', t.edu1_school);
            this.updateElement(eduItems[0], '.education-year', t.edu1_year);
        }

        // Card 2: SAS Certifications
        if (eduItems[1]) {
            this.updateElement(eduItems[1], 'h3', t.edu2_title);
            this.updateElement(eduItems[1], 'h4', t.edu2_school);
            const certs = eduItems[1].querySelectorAll('.certification-list li');
            if (certs.length >= 5) {
                certs[0].textContent = t.edu2_cert1;
                certs[1].textContent = t.edu2_cert2;
                certs[2].textContent = t.edu2_cert3;
                certs[3].textContent = t.edu2_cert4;
                certs[4].textContent = t.edu2_cert5;
            }
        }

        // Card 3: Additional Training
        if (eduItems[2]) {
            this.updateElement(eduItems[2], 'h3', t.edu3_title);
            const certs = eduItems[2].querySelectorAll('.certification-list li');
            if (certs.length >= 5) {
                certs[0].textContent = t.edu3_cert1;
                certs[1].textContent = t.edu3_cert2;
                certs[2].textContent = t.edu3_cert3;
                certs[3].textContent = t.edu3_cert4;
                certs[4].textContent = t.edu3_cert5;
            }
        }

        // Card 4: Sabbatical
        if (eduItems[3]) {
            this.updateElement(eduItems[3], 'h3', t.edu4_title);
            this.updateElement(eduItems[3], 'h4', t.edu4_year);
            this.updateElement(eduItems[3], 'p', t.edu4_desc);
        }
    }

    updateSkills(lang, t) {
        const skillCategories = document.querySelectorAll('.skill-category h3');
        if (skillCategories.length >= 4) {
            skillCategories[0].textContent = t.skill_cat1;
            skillCategories[1].textContent = t.skill_cat2;
            skillCategories[2].textContent = t.skill_cat3;
            skillCategories[3].textContent = t.skill_cat4;
        }

        // Update "Gestion des Parties Prenantes" / "Stakeholder Management"
        const stakeholderSkill = Array.from(document.querySelectorAll('.skill-item .skill-info span')).find(
            span => span.textContent.includes('Gestion des Parties Prenantes') || span.textContent.includes('Stakeholder Management')
        );
        if (stakeholderSkill) {
            stakeholderSkill.textContent = t.skill_stakeholder;
        }

        // Update AWS & Azure cloud note
        const cloudSkill = Array.from(document.querySelectorAll('.skill-item .skill-info span')).find(
            span => span.textContent.includes('AWS & Azure') || span.textContent.includes('Utilisateur SAS Viya') || span.textContent.includes('SAS Viya User')
        );
        if (cloudSkill) {
            cloudSkill.innerHTML = `AWS & Azure <small style="color: #888; font-size: 0.85em;">${t.skill_cloud_user}</small>`;
        }

        // Update cloud experience description
        const cloudNote = Array.from(document.querySelectorAll('.skill-item div[style*="font-size: 0.85em"]')).find(
            div => div.textContent.includes('tant qu\'utilisateur') || div.textContent.includes('as SAS Viya user')
        );
        if (cloudNote) {
            cloudNote.textContent = t.skill_cloud_note;
        }
    }

    updateContact(lang, t) {
        // Contact info heading and description
        const contactInfoHeading = document.querySelector('.contact-info h3');
        if (contactInfoHeading) contactInfoHeading.textContent = t.contact_info_heading;

        const contactInfoDesc = document.querySelector('.contact-info > p');
        if (contactInfoDesc) contactInfoDesc.textContent = t.contact_info_desc;

        // Contact method boxes
        const contactMethods = document.querySelectorAll('.contact-method');
        if (contactMethods.length >= 3) {
            // Location
            this.updateElement(contactMethods[0], 'h4', t.contact_location_label);
            this.updateElement(contactMethods[0], 'p', t.contact_location_value);

            // Availability
            this.updateElement(contactMethods[1], 'h4', t.contact_availability_label);
            this.updateElement(contactMethods[1], 'p', t.contact_availability_value);

            // Response time
            this.updateElement(contactMethods[2], 'h4', t.contact_response_label);
            this.updateElement(contactMethods[2], 'p', t.contact_response_value);
        }

        // Contact note
        const contactNote = document.querySelector('.contact-note');
        if (contactNote) {
            contactNote.innerHTML = t.contact_note;
        }

        // Form labels and placeholders
        const nameLabel = document.querySelector('label[for="name"]');
        if (nameLabel) nameLabel.textContent = t.contact_form_name;

        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.placeholder = t.contact_form_name_placeholder;

        const emailLabel = document.querySelector('label[for="email"]');
        if (emailLabel) emailLabel.textContent = t.contact_form_email;

        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.placeholder = t.contact_form_email_placeholder;

        const subjectLabel = document.querySelector('label[for="subject"]');
        if (subjectLabel) subjectLabel.textContent = t.contact_form_subject;

        const subjectInput = document.getElementById('subject');
        if (subjectInput) subjectInput.placeholder = t.contact_form_subject_placeholder;

        const messageLabel = document.querySelector('label[for="message"]');
        if (messageLabel) messageLabel.textContent = t.contact_form_message;

        const messageInput = document.getElementById('message');
        if (messageInput) messageInput.placeholder = t.contact_form_message_placeholder;

        const submitBtn = document.querySelector('.contact-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = t.contact_form_btn;

        // Form note "* Champs obligatoires" / "* Required fields"
        const formNote = document.querySelector('.form-note');
        if (formNote) formNote.textContent = t.contact_form_note;
    }

    updateElement(parent, selector, text) {
        const element = parent.querySelector(selector);
        if (element && text) {
            element.textContent = text;
        }
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
});
