// Chatbot IA pour le CV de Benoit Gaulin
// Utilise l'API Claude d'Anthropic

class CVChatbot {
    constructor() {
        // Plus besoin de stocker la clé API - elle est sur le serveur
        this.conversationHistory = [];
        this.initializeElements();
        this.attachEventListeners();
        this.hideApiKeySetup(); // Plus besoin de demander la clé API
    }

    initializeElements() {
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatbotWindow = document.getElementById('chatbotWindow');
        this.chatbotMessages = document.getElementById('chatbotMessages');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.apiKeySetup = document.getElementById('apiKeySetup');
        this.chatInputArea = document.getElementById('chatInputArea');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.saveApiKeyButton = document.getElementById('saveApiKey');
        this.resetApiKeyButton = document.getElementById('resetApiKey');
    }

    attachEventListeners() {
        // Toggle chatbot window
        this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());

        // Save API key
        this.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Reset API key
        this.resetApiKeyButton.addEventListener('click', () => this.resetApiKey());

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    toggleChatbot() {
        this.chatbotToggle.classList.toggle('active');
        this.chatbotWindow.classList.toggle('active');
    }

    hideApiKeySetup() {
        // Plus besoin de setup API key - masquer complètement
        this.apiKeySetup.style.display = 'none';
        this.chatInputArea.style.display = 'flex';
        this.resetApiKeyButton.style.display = 'none';
    }

    saveApiKey() {
        // Plus nécessaire - la clé API est sur le serveur
    }

    resetApiKey() {
        // Plus nécessaire - la clé API est sur le serveur
    }

    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Disable send button
        this.sendButton.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callClaudeAPI(message);
            this.removeTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('bot', `Erreur: ${error.message}. Veuillez vérifier votre clé API.`);
        } finally {
            this.sendButton.disabled = false;
        }
    }

    async callClaudeAPI(userMessage) {
        // Get CV context
        const cvContext = this.getCVContext();

        // Get current language from localStorage or default to 'fr'
        const currentLang = localStorage.getItem('language') || 'fr';

        // Build messages array
        const messages = [
            ...this.conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];

        // Appeler notre serverless function au lieu de l'API directement
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                cvContext: cvContext,
                language: currentLang
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la communication avec le serveur');
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Update conversation history
        this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage }
        );

        // Keep only last 10 messages
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }

        return assistantMessage;
    }

    getCVContext() {
        // Extract CV information from the page
        const experiences = Array.from(document.querySelectorAll('.timeline-content')).map(exp => {
            const date = exp.querySelector('.timeline-date')?.textContent || '';
            const title = exp.querySelector('h3')?.textContent || '';
            const company = exp.querySelector('h4')?.textContent || '';
            const description = exp.querySelector('p')?.textContent || '';
            const achievements = Array.from(exp.querySelectorAll('.achievement-list li')).map(li => li.textContent);

            return `${date} - ${title} chez ${company}\n${description}\nRéalisations: ${achievements.join('; ')}`;
        }).join('\n\n');

        const skills = Array.from(document.querySelectorAll('.skill-category')).map(cat => {
            const categoryName = cat.querySelector('h3')?.textContent || '';
            const skillsList = Array.from(cat.querySelectorAll('.skill-info span:first-child')).map(s => s.textContent);
            return `${categoryName}: ${skillsList.join(', ')}`;
        }).join('\n');

        const about = document.querySelector('.about-text')?.textContent || '';

        return `À PROPOS:\n${about}\n\nEXPÉRIENCES PROFESSIONNELLES:\n${experiences}\n\nCOMPÉTENCES:\n${skills}`;
    }

    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(contentDiv);
        this.chatbotMessages.appendChild(messageDiv);

        // Scroll to bottom
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.chatbotMessages.appendChild(typingDiv);
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingMessage = this.chatbotMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CVChatbot();
});
