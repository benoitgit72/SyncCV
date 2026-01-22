// ============================================
// Module d'upload de photo de profil
// ============================================

/**
 * Redimensionne une image avant l'upload
 */
function resizeImage(file, maxWidth = 400, maxHeight = 400) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculer les nouvelles dimensions en maintenant le ratio
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                // Créer un canvas pour le redimensionnement
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Erreur lors de la conversion de l\'image'));
                        }
                    },
                    'image/jpeg',
                    0.85 // Qualité JPEG (85%)
                );
            };

            img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
    });
}

/**
 * Upload une photo de profil vers Supabase Storage
 */
async function uploadProfilePhoto(userId, file) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.');
        }

        // Vérifier la taille (max 5MB avant redimensionnement)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('Le fichier est trop volumineux. Maximum 5 MB.');
        }

        console.log('📸 Redimensionnement de l\'image...');

        // Redimensionner l'image
        const resizedBlob = await resizeImage(file, 400, 400);

        console.log(`📏 Taille originale: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`📏 Taille après redimensionnement: ${(resizedBlob.size / 1024).toFixed(2)} KB`);

        // Chemin du fichier dans Storage
        const filePath = `${userId}/profile.jpg`;

        // Supprimer l'ancienne photo si elle existe
        await supabase.storage
            .from('profile-photos')
            .remove([filePath]);

        console.log('📤 Upload de la photo...');

        // Upload la nouvelle photo
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, resizedBlob, {
                contentType: 'image/jpeg',
                upsert: true // Remplace si existe déjà
            });

        if (error) throw error;

        console.log('✅ Photo uploadée:', data);

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

        console.log('🔗 URL publique:', publicUrl);

        return publicUrl;

    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        throw error;
    }
}

/**
 * Supprime la photo de profil
 */
async function deleteProfilePhoto(userId) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const filePath = `${userId}/profile.jpg`;

        const { error } = await supabase.storage
            .from('profile-photos')
            .remove([filePath]);

        if (error) throw error;

        console.log('✅ Photo supprimée');
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
    }
}

/**
 * Prévisualise une image avant l'upload
 */
function previewImage(file, imgElement) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            imgElement.src = e.target.result;
            resolve(e.target.result);
        };

        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
    });
}

/**
 * Vérifie si une photo existe dans le Storage
 */
async function checkPhotoExists(userId) {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Client Supabase non initialisé');
        }

        const filePath = `${userId}/profile.jpg`;

        const { data, error } = await supabase.storage
            .from('profile-photos')
            .list(userId);

        if (error) throw error;

        const photoExists = data && data.some(file => file.name === 'profile.jpg');
        return photoExists;

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        return false;
    }
}

/**
 * Obtient l'URL de la photo de profil
 */
function getProfilePhotoUrl(userId) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return null;
    }

    const filePath = `${userId}/profile.jpg`;
    const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

    // Ajouter un timestamp pour éviter le cache
    return `${publicUrl}?t=${Date.now()}`;
}
