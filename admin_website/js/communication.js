// ============================================
// Communication Module
// ============================================

/**
 * Load communication section
 */
async function loadCommunication() {
    console.log('📧 Loading communication...');

    // Setup form handler
    const form = document.getElementById('messageForm');
    if (form) {
        form.onsubmit = handleMessageSubmit;
    }

    // Setup preview button
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.onclick = handlePreview;
    }

    // Load message history
    await loadMessageHistory();
}

/**
 * Handle message form submission
 */
async function handleMessageSubmit(e) {
    e.preventDefault();

    const subject = document.getElementById('messageSubject').value;
    const message = document.getElementById('messageContent').value;
    const confirmed = document.getElementById('confirmSend').checked;

    if (!confirmed) {
        alert('Veuillez confirmer l\'envoi du message');
        return;
    }

    try {
        const supabase = getSupabaseClient();

        // Count recipients
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Confirm with user
        if (!confirm(`Envoyer ce message à ${count} utilisateurs?`)) {
            return;
        }

        // Save message to database
        const { data, error } = await supabase
            .from('admin_messages')
            .insert([{
                subject: subject,
                message: message,
                sent_by: currentUser.id,
                recipient_count: count
            }])
            .select()
            .single();

        if (error) throw error;

        showToast('Message sauvegardé avec succès', 'success');

        // Reset form
        document.getElementById('messageForm').reset();

        // Reload history
        await loadMessageHistory();

    } catch (error) {
        console.error('Erreur envoi message:', error);
        showToast('Erreur: ' + error.message, 'error');
    }
}

/**
 * Handle preview button
 */
function handlePreview() {
    const subject = document.getElementById('messageSubject').value;
    const message = document.getElementById('messageContent').value;

    if (!subject || !message) {
        alert('Veuillez remplir le sujet et le message');
        return;
    }

    // Open preview in new window
    const previewWindow = window.open('', 'Preview', 'width=600,height=400');
    if (!previewWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'aperçu. Vérifiez que les popups ne sont pas bloqués.');
        return;
    }

    previewWindow.document.write(`
        <html>
        <head>
            <title>Aperçu du message</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                }
                h1 {
                    font-size: 18px;
                    color: #667eea;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 10px;
                }
                .message {
                    white-space: pre-wrap;
                    line-height: 1.6;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Sujet: ${escapeHtml(subject)}</h1>
            <div class="message">${escapeHtml(message)}</div>
        </body>
        </html>
    `);
}

/**
 * Load message history
 */
async function loadMessageHistory() {
    try {
        const supabase = getSupabaseClient();

        const { data: messages, error } = await supabase
            .from('admin_messages')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        const historyDiv = document.getElementById('messageHistory');
        if (!historyDiv) return;

        if (!messages || messages.length === 0) {
            historyDiv.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 30px;">Aucun message envoyé</p>';
            return;
        }

        historyDiv.innerHTML = messages.map(msg => `
            <div class="message-item">
                <div class="message-item-header">
                    <div class="message-subject">${escapeHtml(msg.subject)}</div>
                    <div class="message-date">${formatDate(msg.sent_at)}</div>
                </div>
                <div class="message-content">${escapeHtml(msg.message.substring(0, 200))}${msg.message.length > 200 ? '...' : ''}</div>
                <div class="message-meta">
                    Envoyé à ${msg.recipient_count} utilisateurs
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erreur chargement historique:', error);
        const historyDiv = document.getElementById('messageHistory');
        if (historyDiv) {
            historyDiv.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 30px;">Erreur lors du chargement de l\'historique</p>';
        }
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
