# Troubleshooting : Row-Level Security (RLS)

## 🔴 Erreur Rencontrée

```
ERROR: 42710: policy "Users can update their own profile" for table "profiles" already exists
```

### Cause
Le script RLS a été partiellement exécuté ou des politiques existaient déjà. PostgreSQL ne peut pas créer une politique avec un nom qui existe déjà.

## ✅ Solution : Utiliser le Script Sécurisé

Utilisez le nouveau fichier : **`supabase-setup-rls-security-safe.sql`**

### Différences avec l'ancien script

| Ancien Script | Nouveau Script (Safe) |
|---------------|----------------------|
| `CREATE POLICY ...` | `DROP POLICY IF EXISTS ...` puis `CREATE POLICY ...` |
| Échoue si politique existe | Peut être exécuté plusieurs fois |
| Pas idempotent | Idempotent ✅ |

### Ce que fait le nouveau script

1. **Supprime toutes les politiques existantes** (`DROP POLICY IF EXISTS`)
2. **Réactive RLS** sur toutes les tables
3. **Recrée toutes les politiques** de zéro
4. **Affiche un rapport détaillé** de la configuration
5. **Peut être réexécuté** sans erreur

## 📋 Comment Exécuter le Script Safe

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Menu de gauche → **SQL Editor**
4. Cliquez sur **"+ New query"**

### Étape 2 : Copier le Script

Copiez tout le contenu de **`supabase-setup-rls-security-safe.sql`**

### Étape 3 : Exécuter

1. Collez le script dans l'éditeur SQL
2. Cliquez sur **"Run"** (ou Ctrl+Enter)
3. Attendez l'exécution (environ 3-5 secondes)

### Étape 4 : Vérifier les Résultats

Vous devriez voir 3 tableaux de résultats :

#### Tableau 1 : Toutes les Politiques
```
tablename    | policyname                              | cmd    | using_clause
-------------|------------------------------------------|--------|------------------
cv_info      | Public can read all cv_info             | SELECT | USING: true
cv_info      | Users can update their own cv_info      | UPDATE | USING: auth.uid() = user_id
...
```

#### Tableau 2 : Status RLS par Table
```
tablename    | rowsecurity | status
-------------|-------------|----------------
profiles     | true        | ✅ RLS Activé
cv_info      | true        | ✅ RLS Activé
experiences  | true        | ✅ RLS Activé
formations   | true        | ✅ RLS Activé
competences  | true        | ✅ RLS Activé
```

#### Tableau 3 : Compte des Politiques
```
tablename    | policy_count | status
-------------|--------------|------------
profiles     | 4            | ✅ Complet
cv_info      | 5            | ✅ Complet
experiences  | 5            | ✅ Complet
formations   | 5            | ✅ Complet
competences  | 5            | ✅ Complet
```

#### Message de Confirmation
```
════════════════════════════════════════════════════════════
✅ Row-Level Security configuré avec succès !
════════════════════════════════════════════════════════════

🔒 Statistiques :
   - Tables avec RLS activé : 5 / 5
   - Politiques créées : 25

📋 Tables sécurisées :
   ✓ profiles
   ✓ cv_info
   ✓ experiences
   ✓ formations
   ✓ competences
```

## 🔐 Vérification Manuelle de la Sécurité

### Test 1 : Vérifier que RLS est actif

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences');
```

**Résultat attendu** : `rowsecurity = true` pour toutes les tables

### Test 2 : Lister toutes les politiques

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'cv_info', 'experiences', 'formations', 'competences')
ORDER BY tablename, cmd;
```

**Résultat attendu** : 25 politiques au total
- 4 par table pour profiles
- 5 par table pour les autres (cv_info, experiences, formations, competences)

### Test 3 : Simuler un accès utilisateur

```sql
-- Supposons que vous êtes connecté en tant que Ron More
-- user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315'

-- Ceci DEVRAIT fonctionner (ses propres données)
SELECT * FROM cv_info WHERE user_id = 'd5b317b1-34ba-4289-8d40-11fd1b584315';

-- Ceci NE DEVRAIT PAS fonctionner (données d'un autre utilisateur)
-- UPDATE cv_info SET nom = 'Hacked' WHERE user_id = 'autre-user-id';
-- ❌ Sera bloqué par RLS
```

## ⚠️ Problèmes Potentiels

### Problème 1 : "permission denied for table ..."

**Cause** : Vous n'avez pas les droits admin sur Supabase

**Solution** :
- Utilisez le compte propriétaire du projet Supabase
- Ou demandez les droits de "Service Role" (dangereux)

### Problème 2 : "function auth.uid() does not exist"

**Cause** : Vous n'utilisez pas Supabase Auth

**Solution** :
- Si vous n'utilisez pas Supabase Auth, modifiez les politiques pour utiliser `current_user` au lieu de `auth.uid()`
- Ou configurez Supabase Auth (recommandé)

### Problème 3 : Les utilisateurs ne peuvent pas voir leurs données

**Cause** : Le `user_id` dans les tables ne correspond pas à `auth.uid()`

**Solution** :
```sql
-- Vérifier les user_id dans vos tables
SELECT DISTINCT user_id FROM cv_info;

-- Vérifier les auth.uid des utilisateurs créés
SELECT id, email FROM auth.users;

-- Les deux DOIVENT correspondre!
-- Si ce n'est pas le cas, mettez à jour les user_id
UPDATE cv_info SET user_id = 'auth-uid-correct' WHERE user_id = 'ancien-uuid';
```

## 📚 Ressources

- **Documentation Supabase RLS** : https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Policies** : https://www.postgresql.org/docs/current/sql-createpolicy.html
- **Testing RLS** : https://supabase.com/docs/guides/auth/row-level-security#testing-policies

## 🚀 Prochaines Étapes Après RLS

1. **Créer des comptes utilisateurs** dans Supabase Authentication
2. **Mettre à jour les `user_id`** pour qu'ils correspondent aux `auth.uid()`
3. **Tester l'isolation** en vous connectant avec différents comptes
4. **Développer l'interface admin** pour que chaque utilisateur puisse éditer ses données

## 💡 Astuce : Réinitialiser RLS Complètement

Si vous voulez tout recommencer de zéro :

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cv_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE formations DISABLE ROW LEVEL SECURITY;
ALTER TABLE competences DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques
DROP POLICY IF EXISTS "Public can read all profiles" ON profiles;
-- ... (répéter pour chaque politique)

-- Puis réexécuter supabase-setup-rls-security-safe.sql
```

Mais normalement, le script **`supabase-setup-rls-security-safe.sql`** fait déjà tout cela automatiquement! 🎉
