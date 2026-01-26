# Prompt: CV Français → SQL INSERT pour Supabase

## Instructions pour Claude

Tu es un expert en extraction de données de CV et génération de SQL pour Supabase.

**TÂCHE:** Analyser un CV français fourni et générer les requêtes SQL pour mettre à jour les données dans Supabase.

**CONTEXTE IMPORTANT:**
- L'utilisateur existe déjà dans Supabase avec UUID: `24106dd4-48a6-4dec-8c10-0c2bcde4e888`
- Les tables `profiles` et `cv_info` ont déjà une ligne pour cet utilisateur → **UTILISER UPDATE**
- Les tables `experiences`, `formations`, `competences` sont vides → **UTILISER INSERT**

**IMPORTANT:**
- Les tables existent déjà dans Supabase. NE PAS générer de CREATE TABLE
- Générer UPDATE pour profiles et cv_info
- Générer INSERT pour experiences, formations, competences

---

## Structure des Tables Existantes

**Note:** Ces tables sont déjà créées dans Supabase. Voici leurs colonnes pour référence.

### 1. `profiles` (Table principale)
**Colonnes:** `id`, `slug`, `template_id`, `subscription_status`, `created_at`, `updated_at`, `is_admin`, `theme`

### 2. `cv_info` (Informations personnelles)
**Colonnes:** `id`, `user_id`, `nom`, `titre`, `titre_en`, `email`, `telephone`, `bio`, `bio_en`, `linkedin`, `github`, `photo_url`, `formspree_id`, `stat1_fr`, `stat1_en`, `stat2_fr`, `stat2_en`, `stat3_fr`, `stat3_en`, `updated_at`

### 3. `experiences` (Expériences professionnelles)
**Colonnes:** `id`, `user_id`, `titre`, `titre_en`, `entreprise`, `entreprise_en`, `periode_debut`, `periode_fin`, `en_cours`, `description`, `description_en`, `competences` (array), `ordre`, `created_at`, `updated_at`

### 4. `formations` (Formations et certifications)
**Colonnes:** `id`, `user_id`, `diplome`, `diplome_en`, `institution`, `institution_en`, `annee_debut`, `annee_fin`, `description`, `description_en`, `ordre`, `created_at`, `updated_at`

### 5. `competences` (Compétences techniques et soft skills)
**Colonnes:** `id`, `user_id`, `categorie`, `categorie_en`, `competence`, `competence_en`, `niveau`, `niveau_en`, `ordre`, `created_at`, `updated_at`

---

## Format de Sortie Attendu

Génère les requêtes SQL dans cet ordre exact:

```sql
-- ============================================
-- MISE À JOUR CV: [Nom de la personne]
-- UUID Utilisateur: 24106dd4-48a6-4dec-8c10-0c2bcde4e888
-- Date: [Date actuelle]
-- ============================================

-- 1. METTRE À JOUR le profil existant
UPDATE profiles
SET
    slug = '[slug-normalise]',  -- Ex: 'ron-more'
    template_id = 1,
    subscription_status = 'trial',
    theme = 'purple-gradient',
    updated_at = NOW()
WHERE id = '24106dd4-48a6-4dec-8c10-0c2bcde4e888';

-- 2. METTRE À JOUR les informations personnelles existantes
UPDATE cv_info
SET
    nom = '[Nom complet]',
    titre = '[Titre professionnel FR]',
    titre_en = '[Titre professionnel EN]',
    email = '[Email]',
    telephone = '[Téléphone]',
    bio = '[Bio FR]',
    bio_en = '[Bio EN]',
    linkedin = '[LinkedIn URL]',
    github = '[GitHub URL]',
    formspree_id = 'mpqqkbka',
    stat1_fr = '[Stat1 FR]',  -- Ex: '12+ années d''expérience'
    stat1_en = '[Stat1 EN]',  -- Ex: '12+ years of experience'
    stat2_fr = '[Stat2 FR]',
    stat2_en = '[Stat2 EN]',
    stat3_fr = '[Stat3 FR]',
    stat3_en = '[Stat3 EN]',
    updated_at = NOW()
WHERE user_id = '24106dd4-48a6-4dec-8c10-0c2bcde4e888';

-- 3. INSÉRER les expériences professionnelles (ordre chronologique inverse: 0 = plus récent)
-- Note: Supprimer d'abord les anciennes expériences si nécessaire
DELETE FROM experiences WHERE user_id = '24106dd4-48a6-4dec-8c10-0c2bcde4e888';

INSERT INTO experiences (user_id, titre, titre_en, entreprise, entreprise_en, periode_debut, periode_fin, en_cours, description, description_en, competences, ordre)
VALUES
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Titre 1 FR]', '[Titre 1 EN]', '[Entreprise]', '[Entreprise EN]', '2020-01-15', NULL, true, '[Description FR]', '[Description EN]', ARRAY['competence1', 'competence2'], 0),
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Titre 2 FR]', '[Titre 2 EN]', '[Entreprise]', '[Entreprise EN]', '2015-03-01', '2019-12-31', false, '[Description FR]', '[Description EN]', ARRAY['competence1', 'competence2'], 1);

-- 4. INSÉRER les formations et certifications (ordre: 0 = plus récent)
-- Note: Supprimer d'abord les anciennes formations si nécessaire
DELETE FROM formations WHERE user_id = '24106dd4-48a6-4dec-8c10-0c2bcde4e888';

INSERT INTO formations (user_id, diplome, diplome_en, institution, institution_en, annee_debut, annee_fin, description, description_en, ordre)
VALUES
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Diplôme FR]', '[Diplôme EN]', '[Institution]', '[Institution EN]', 2018, 2018, '[Description FR]', '[Description EN]', 0),
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Diplôme FR]', '[Diplôme EN]', '[Institution]', '[Institution EN]', 2011, 2015, '[Description FR]', '[Description EN]', 1);

-- 5. INSÉRER les compétences (groupées par catégorie, ordre: 0 = plus important)
-- Note: Supprimer d'abord les anciennes compétences si nécessaire
DELETE FROM competences WHERE user_id = '24106dd4-48a6-4dec-8c10-0c2bcde4e888';

INSERT INTO competences (user_id, categorie, categorie_en, competence, competence_en, niveau, niveau_en, ordre)
VALUES
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Catégorie FR]', '[Catégorie EN]', '[Compétence FR]', '[Compétence EN]', '[Niveau FR]', '[Niveau EN]', 0),
    ('24106dd4-48a6-4dec-8c10-0c2bcde4e888', '[Catégorie FR]', '[Catégorie EN]', '[Compétence FR]', '[Compétence EN]', '[Niveau FR]', '[Niveau EN]', 1);
```

---

## Règles d'Extraction et de Transformation

### 1. **UUID et Slug**
- **UUID FIXE:** Utiliser TOUJOURS `24106dd4-48a6-4dec-8c10-0c2bcde4e888` (l'utilisateur existe déjà)
- **NE PAS générer de nouvel UUID**
- Slug = prénom-nom en minuscules, sans accents, sans espaces
- Exemples de slug:
  - "Jean-Pierre Dupont" → `jean-pierre-dupont`
  - "Ron More" → `ron-more`
  - "Marie Tremblay" → `marie-tremblay`

### 2. **Dates**
- Format SQL: `'YYYY-MM-DD'`
- Si seule l'année est connue: utiliser `'YYYY-01-01'`
- Si "en cours" ou "actuel": `en_cours = true`, `periode_fin = NULL`

### 3. **Traductions EN**
- Traduire TOUS les champs avec suffixe `_en`
- Garder noms propres (entreprises, institutions) identiques
- Traduire titres de poste, descriptions, compétences

### 4. **Statistiques (stat1, stat2, stat3)**
- Calculer à partir du CV:
  - **stat1**: Années d'expérience totale
  - **stat2**: Nombre de technologies/outils maîtrisés
  - **stat3**: Nombre de projets/certifications
- Format: "[Nombre]+ [description]"
- Exemples:
  - FR: "15+ années d'expérience"
  - EN: "15+ years of experience"

### 5. **Compétences (competences)**
- Extraire toutes les compétences techniques
- Grouper par catégorie logique:
  - "Langages de Programmation" / "Programming Languages"
  - "Frameworks & Bibliothèques" / "Frameworks & Libraries"
  - "Bases de Données" / "Databases"
  - "Outils & Technologies" / "Tools & Technologies"
  - "Soft Skills" / "Soft Skills"
- Niveaux possibles:
  - "Expert" / "Expert"
  - "Avancé" / "Advanced"
  - "Intermédiaire" / "Intermediate"
  - "Débutant" / "Beginner"

### 6. **Ordre (ordre)**
- Expériences: 0 = plus récent, incrémente vers le passé
- Formations: 0 = plus récent
- Compétences: 0 = plus important

### 7. **Descriptions**
- Extraire bullet points des expériences
- Format: texte continu avec sauts de ligne (`\n`) entre les points
- Longueur max recommandée: 500 caractères

### 8. **Array competences dans experiences**
- Extraire 3-6 compétences clés par expérience
- Format SQL: `ARRAY['Python', 'Django', 'PostgreSQL']`

---

## Exemple de CV en Entrée

```
Marie Tremblay
Chef de Projet Technique Senior

marie.tremblay@email.com | +1 514-555-0123
LinkedIn: linkedin.com/in/marietremblay
GitHub: github.com/mtremblay

PROFIL
Chef de projet technique passionnée avec 12 ans d'expérience en gestion
de projets complexes dans le domaine des technologies de l'information...

EXPÉRIENCE PROFESSIONNELLE

Chef de Projet Technique Senior | Acme Corp | 2020 - Présent
• Direction de projets de transformation digitale ($5M+ budget)
• Gestion d'équipes distribuées (15+ personnes)
• Implémentation méthodologies Agile/Scrum

Analyste-Programmeur Senior | TechStart Inc. | 2015 - 2020
• Développement applications web avec Python/Django
• Architecture microservices et APIs RESTful

FORMATION
Baccalauréat en Génie Logiciel | Université de Montréal | 2011 - 2015
Certification PMP | PMI | 2018

COMPÉTENCES
• Gestion de projet: Agile, Scrum, Jira, Confluence
• Langages: Python, JavaScript, SQL
• Technologies: Django, React, PostgreSQL, Docker
```

---

## Instructions Finales

1. **Lis attentivement le CV fourni**
2. **Extrais toutes les informations** (ne laisse rien de côté)
3. **Traduis en anglais** tous les champs `_en`
4. **Génère UPDATE pour profiles et cv_info** (lignes existantes)
5. **Génère DELETE puis INSERT pour experiences, formations, competences** (remplacer toutes les données)
6. **Utilise TOUJOURS l'UUID: `24106dd4-48a6-4dec-8c10-0c2bcde4e888`** dans toutes les requêtes
7. **Vérifie la syntaxe SQL** (virgules, guillemets, parenthèses)
8. **Échappe les apostrophes** dans les textes (` '` → `''`)
9. **Ajoute des commentaires** pour clarifier les sections

---

## Utilisation

**Copier ce prompt dans une nouvelle conversation Claude avec le CV:**

```
[Coller ce prompt complet]

---

Voici le CV à transformer en SQL INSERT:

[Coller le CV ici]
```

Claude générera alors les INSERT statements prêts à être exécutés dans Supabase SQL Editor.

**Pour exécuter dans Supabase:**
1. Ouvrir Supabase Dashboard → SQL Editor
2. Coller les INSERT statements générés
3. Cliquer sur "Run" pour exécuter
4. Vérifier que toutes les données ont été insérées correctement

---

## Notes Importantes

- **Tables:** Les tables existent déjà. NE PAS générer de CREATE TABLE
- **UUID FIXE:** Utiliser TOUJOURS `24106dd4-48a6-4dec-8c10-0c2bcde4e888` (ne pas générer de nouvel UUID)
- **UPDATE vs INSERT:**
  - `profiles` et `cv_info` → **UPDATE** (lignes existantes)
  - `experiences`, `formations`, `competences` → **DELETE puis INSERT** (remplacer tout)
- **Échappement:** Échapper les apostrophes dans le texte: `'` → `''`
- **NULL:** Utiliser `NULL` (sans guillemets) pour valeurs manquantes
- **Arrays:** Format PostgreSQL: `ARRAY['item1', 'item2']`
- **Dates:** Format ISO: `'2024-01-15'` ou `NULL` si en cours

---

## Vérification Post-Génération

Après génération, vérifier:
- ✓ L'UUID `24106dd4-48a6-4dec-8c10-0c2bcde4e888` est utilisé partout
- ✓ UPDATE utilisé pour `profiles` et `cv_info`
- ✓ DELETE + INSERT utilisés pour `experiences`, `formations`, `competences`
- ✓ Les dates sont au format 'YYYY-MM-DD'
- ✓ Les apostrophes sont échappées (`'` → `''`)
- ✓ Les arrays sont bien formatés (`ARRAY['item1', 'item2']`)
- ✓ Tous les champs obligatoires sont remplis
- ✓ Les traductions EN sont présentes pour tous les champs `_en`
- ✓ Le slug est correctement formaté (minuscules, sans accents)

---

*Généré pour SyncCV v1.12.x - Système de gestion de CV bilingues*
