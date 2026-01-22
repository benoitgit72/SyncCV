# Guide d'upload de photo de profil

## Vue d'ensemble

Le système d'upload de photo utilise **Supabase Storage** pour héberger les photos de profil de manière sécurisée et performante.

## Architecture

```
┌─────────────────────────────────────┐
│  Dashboard Admin                    │
│  └─ Interface d'upload              │
└─────────────────────────────────────┘
            ↓ Upload
┌─────────────────────────────────────┐
│  Supabase Storage                   │
│  Bucket: profile-photos             │
│  ├─ {user_id_1}/profile.jpg         │
│  ├─ {user_id_2}/profile.jpg         │
│  └─ {user_id_3}/profile.jpg         │
└─────────────────────────────────────┘
            ↓ URL sauvegardée
┌─────────────────────────────────────┐
│  Table: cv_info                     │
│  └─ photo_url: https://...          │
└─────────────────────────────────────┐
            ↓ Affichage
┌─────────────────────────────────────┐
│  CV Public                          │
│  └─ <img src="{photo_url}">         │
└─────────────────────────────────────┘
```

## Configuration Supabase (OBLIGATOIRE)

### Étape 1: Créer le bucket Storage

1. Allez sur **Supabase Dashboard** → **Storage**
2. Cliquez sur **New bucket**
3. Configurez:
   - **Name**: `profile-photos`
   - **Public**: ✅ (coché)
4. Cliquez sur **Create bucket**

### Étape 2: Configurer les politiques RLS

Exécutez le script `supabase-setup-storage.sql` dans le **SQL Editor**:

```bash
# Le script configure:
- Lecture publique (pour afficher les CVs)
- Upload/Update/Delete restreint à l'utilisateur propriétaire
```

**Vérification**: Les politiques devraient apparaître dans **Storage** → **profile-photos** → **Policies**

## Fonctionnalités

### ✅ Upload de photo
- Formats supportés: **JPG, PNG, WEBP**
- Taille maximale: **5 MB**
- Redimensionnement automatique: **400x400px**
- Qualité JPEG: **85%**
- Compression automatique

### ✅ Prévisualisation
- Affichage immédiat après sélection
- Avant sauvegarde dans Supabase

### ✅ Gestion sécurisée
- RLS: Chaque utilisateur ne peut modifier que sa propre photo
- Organisation par dossier utilisateur: `{user_id}/profile.jpg`
- URLs publiques pour affichage des CVs

### ✅ Suppression
- Bouton de suppression visible quand une photo existe
- Confirmation avant suppression
- Nettoyage complet (Storage + Database)

## Utilisation dans le Dashboard Admin

### Pour uploader une photo:

1. Connectez-vous à `/admin_cv`
2. Allez dans **Informations personnelles**
3. Cliquez sur **📸 Choisir une photo**
4. Sélectionnez une image (JPG, PNG, WEBP)
5. La photo est automatiquement:
   - Prévisualisée
   - Redimensionnée à 400x400px
   - Uploadée vers Supabase Storage
   - Sauvegardée dans `cv_info.photo_url`

### Pour supprimer une photo:

1. Cliquez sur **🗑️ Supprimer**
2. Confirmez la suppression
3. La photo est supprimée du Storage et de la base de données

## URLs générées

### Format de l'URL publique:
```
https://btcdbewqypejzmlwwedz.supabase.co/storage/v1/object/public/profile-photos/{user_id}/profile.jpg
```

### Exemple:
```
User ID: 550e8400-e29b-41d4-a716-446655440000
URL: https://btcdbewqypejzmlwwedz.supabase.co/storage/v1/object/public/profile-photos/550e8400-e29b-41d4-a716-446655440000/profile.jpg
```

## Affichage dans le CV public

Le fichier `cv-loader.js` charge automatiquement la photo depuis `cv_info.photo_url`:

```javascript
if (cvInfo.photo_url) {
    const photoElement = document.querySelector('.profile-photo');
    if (photoElement) {
        photoElement.src = cvInfo.photo_url;
        photoElement.alt = `${cvInfo.nom} - Photo de profil`;
    }
}
```

**Emplacement dans le CV:**
- Section Hero (en haut de la page)
- Balise: `<img class="profile-photo">`

## Fichiers créés

### Scripts SQL
- `supabase-setup-storage.sql` - Configuration du bucket et RLS

### Modules JavaScript
- `admin_cv/js/photo-upload.js` - Logique d'upload, redimensionnement, suppression

### Interface
- `admin_cv/index.html` - Section d'upload dans Informations personnelles
- `admin_cv/css/admin-styles.css` - Styles pour la prévisualisation

### Intégration
- `admin_cv/js/dashboard.js` - Gestion des événements d'upload

## Optimisations appliquées

### 1. Redimensionnement côté client
- Réduit la taille du fichier uploadé
- Économise la bande passante
- Upload plus rapide

### 2. Compression JPEG
- Qualité 85% (bon compromis qualité/taille)
- Réduit la taille de ~50-70%

### 3. Format uniforme
- Toutes les photos converties en JPEG
- Nom de fichier standardisé: `profile.jpg`

### 4. Cache busting
- URL avec timestamp pour éviter le cache du navigateur
- Force le rechargement après modification

## Sécurité

### Row Level Security (RLS)
```sql
-- Lecture publique
ON storage.objects FOR SELECT TO public

-- Modification restreinte
ON storage.objects FOR INSERT/UPDATE/DELETE TO authenticated
WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text)
```

**Protection:**
- ❌ Un utilisateur ne peut PAS uploader dans le dossier d'un autre
- ❌ Un utilisateur ne peut PAS supprimer la photo d'un autre
- ✅ Tout le monde peut VOIR les photos (pour les CVs publics)

## Gestion des erreurs

### Erreurs communes:

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Format non supporté" | Fichier ni JPG, PNG, ni WEBP | Convertir l'image |
| "Fichier trop volumineux" | > 5 MB | Compresser l'image |
| "Bucket non trouvé" | Bucket pas créé | Créer `profile-photos` |
| "Accès refusé" | RLS pas configuré | Exécuter SQL RLS |

## Migration depuis photo locale

Si vous avez actuellement `photo-profile.jpg` à la racine:

1. **Pour chaque utilisateur:**
   - Connectez-vous au dashboard admin
   - Uploadez la photo via l'interface
   - L'URL sera automatiquement mise à jour

2. **Ou via script (optionnel):**
   ```javascript
   // À exécuter dans la console du dashboard
   const file = await fetch('/photo-profile.jpg').then(r => r.blob());
   const photoUrl = await uploadProfilePhoto(currentUser.id, file);
   await upsertCVInfo(currentUser.id, { photo_url: photoUrl });
   ```

## Limites du plan gratuit Supabase

- **Storage**: 1 GB total
- **Bande passante**: 2 GB/mois
- **Requêtes**: Illimitées

**Estimation:**
- 1 photo = ~50-100 KB (après redimensionnement)
- 1 GB = ~10,000-20,000 photos
- Largement suffisant pour une application de CV

## Bonnes pratiques

### ✅ À faire:
- Utiliser des photos carrées (meilleur rendu)
- Photos de bonne qualité (minimum 400x400px)
- Format JPEG pour les photos réelles
- Format PNG pour les logos/illustrations

### ❌ À éviter:
- Photos trop lourdes (> 5 MB)
- Formats exotiques (BMP, TIFF)
- Images animées (GIF animés)
- Contenus inappropriés

## Support et dépannage

### Vérifier la configuration:
```sql
-- Dans Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'profile-photos';
SELECT * FROM storage.policies WHERE bucket_id = 'profile-photos';
```

### Tester l'upload manuellement:
1. Console navigateur (F12)
2. Onglet Network
3. Tenter un upload
4. Vérifier les requêtes vers `/storage/v1/object/`

### Logs:
- Console navigateur: Messages de debug avec emoji
- Supabase Dashboard → Logs: Requêtes Storage

## Ressources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images)
