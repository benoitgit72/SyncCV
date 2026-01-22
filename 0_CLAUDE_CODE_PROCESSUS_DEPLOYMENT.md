# Processus de Déploiement - SyncCV

Ce document décrit le processus standard de déploiement pour le projet SyncCV, incluant la création de tags Git pour faciliter les rollbacks.

## Vue d'ensemble

Chaque déploiement doit être marqué avec un **tag Git** pour permettre un retour en arrière facile si nécessaire. Le versioning suit le schéma de [Semantic Versioning](https://semver.org/):

- **MAJOR** (v1.0.0 → v2.0.0): Changements incompatibles, refonte majeure
- **MINOR** (v1.0.0 → v1.1.0): Nouvelles fonctionnalités, compatibles avec l'existant
- **PATCH** (v1.0.0 → v1.0.1): Corrections de bugs, petits ajustements

---

## Processus Standard de Déploiement

### 1. Vérifier l'état du dépôt

```bash
# Vérifier qu'on est sur la branche main
git branch --show-current

# Vérifier l'état des fichiers
git status

# Voir les changements non committés
git diff
```

### 2. Committer les changements

```bash
# Ajouter les fichiers modifiés
git add .

# Créer le commit avec un message descriptif
git commit -m "Description des changements

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Exemples de messages de commit:**
- `"Add: AI-powered tag suggestions for experiences"`
- `"Fix: Delete icon visibility on red background"`
- `"Update: Translation buttons in experience modals"`
- `"Refactor: Improve date formatting in dashboard"`

### 3. Déterminer le type de version

Avant de créer un tag, déterminez le type d'incrémentation:

| Type de changement | Incrément | Exemple |
|-------------------|-----------|---------|
| Correction de bug | PATCH | v1.0.0 → v1.0.1 |
| Nouvelle fonctionnalité | MINOR | v1.0.1 → v1.1.0 |
| Refonte majeure | MAJOR | v1.1.0 → v2.0.0 |

### 4. Créer un tag Git annoté

```bash
# Voir le dernier tag existant
git tag -l "v*.*.*" | sort -V | tail -n 1

# Créer un tag annoté (RECOMMANDÉ)
git tag -a v1.2.0 -m "Version 1.2.0 - Description des changements majeurs

- Ajout de la traduction automatique
- Suggestions de tags IA
- Amélioration de l'icône de suppression

Date: $(date '+%Y-%m-%d %H:%M:%S')
"
```

**Pourquoi un tag annoté?**
- Contient le nom de l'auteur, la date, et un message
- Peut être signé (GPG)
- Stocké comme objet complet dans Git

### 5. Pousser vers GitHub

```bash
# Pousser les commits
git push origin main

# Pousser le tag
git push origin v1.2.0

# OU pousser tous les tags d'un coup
git push origin --tags
```

### 6. Déploiement automatique sur Vercel

Une fois poussé sur GitHub, Vercel déploie automatiquement:
1. Détecte le nouveau commit sur `main`
2. Build le projet
3. Déploie sur `synccv.vercel.app`
4. Confirmation de déploiement (environ 1-2 minutes)

---

## Rollback - Retour en Arrière

Si un problème survient après un déploiement:

### Méthode 1: Checkout vers une version antérieure

```bash
# Lister tous les tags disponibles
git tag -l -n1

# Voir les détails d'un tag
git show v1.1.0

# Créer une branche de rollback depuis un tag
git checkout v1.1.0
git checkout -b rollback-to-v1.1.0

# Vérifier que tout fonctionne correctement
# Puis pousser la branche de rollback
git push origin rollback-to-v1.1.0

# Fusionner dans main si satisfait
git checkout main
git merge rollback-to-v1.1.0
git push origin main
```

### Méthode 2: Revert du dernier commit

```bash
# Annuler le dernier commit (crée un nouveau commit d'annulation)
git revert HEAD

# Pousser
git push origin main
```

### Méthode 3: Reset (DESTRUCTIF - à utiliser avec précaution)

```bash
# Revenir à un tag spécifique (DESTRUCTIF)
git reset --hard v1.1.0

# Force push (nécessite confirmation)
git push origin main --force
```

⚠️ **ATTENTION**: `git reset --hard` et `git push --force` sont destructifs. À n'utiliser qu'en dernier recours.

---

## Commandes Utiles

### Gestion des tags

```bash
# Lister tous les tags
git tag

# Lister les tags avec leurs messages
git tag -l -n1

# Supprimer un tag local
git tag -d v1.2.0

# Supprimer un tag distant
git push origin --delete v1.2.0

# Renommer un tag (supprimer + recréer)
git tag v1.2.1 v1.2.0
git tag -d v1.2.0
git push origin v1.2.1
git push origin --delete v1.2.0
```

### Historique et comparaisons

```bash
# Voir l'historique avec les tags
git log --oneline --decorate --graph

# Voir tous les tags avec leurs dates
git log --tags --simplify-by-decoration --pretty="format:%ai %d"

# Comparer deux versions
git diff v1.1.0 v1.2.0

# Voir les fichiers changés entre deux versions
git diff --name-only v1.1.0 v1.2.0

# Voir les commits entre deux versions
git log v1.1.0..v1.2.0 --oneline
```

---

## Workflow Recommandé

### Pour Claude Code (Assistant IA)

Lors de chaque déploiement:

1. ✅ Vérifier que tous les changements sont testés
2. ✅ Créer un commit avec message descriptif
3. ✅ Déterminer le type de version (patch/minor/major)
4. ✅ Créer un tag Git annoté
5. ✅ Pousser commits + tag vers GitHub
6. ✅ Vérifier le déploiement Vercel
7. ✅ Informer l'utilisateur du tag créé et des instructions de rollback

**Template de message après déploiement:**

```
✅ Déploiement réussi!

Tag créé: v1.2.0
Commit: abc1234 - Description du changement

Pour revenir à la version précédente (v1.1.0):
  git checkout v1.1.0
  git checkout -b rollback-to-v1.1.0

Pour voir les changements:
  git diff v1.1.0 v1.2.0
```

---

## Historique des Versions

### v0.1.0 - Version initiale
- Configuration de base de SyncCV
- Authentification Supabase
- CV public consultable

### v0.2.0 - Interface admin
- Dashboard d'administration
- CRUD des expériences
- Gestion bilingue FR/EN

### v0.3.0 - Fonctionnalités IA
- Traduction automatique via Claude Haiku
- Suggestions de tags intelligentes
- Amélioration des icônes SVG

### (À mettre à jour au fur et à mesure)

---

## Bonnes Pratiques

### ✅ À FAIRE

- Toujours créer un tag pour chaque déploiement
- Utiliser des tags annotés (`git tag -a`)
- Suivre le Semantic Versioning
- Tester avant de déployer
- Documenter les changements majeurs
- Garder un historique clair des versions

### ❌ À ÉVITER

- Ne jamais utiliser `--force` sur `main` sans raison
- Ne pas sauter de versions (v1.0.0 → v1.2.0 sans v1.1.0)
- Ne pas modifier un tag existant (supprimer + recréer)
- Ne pas déployer sans commit
- Ne pas oublier de pousser les tags (`git push --tags`)

---

## Troubleshooting

### Problème: "Tag already exists"

```bash
# Le tag existe déjà localement
git tag -d v1.2.0
git tag -a v1.2.0 -m "Nouveau message"
```

### Problème: "Déploiement Vercel échoue"

1. Vérifier les logs Vercel: https://vercel.com/dashboard
2. Vérifier les variables d'environnement (SUPABASE_URL, ANTHROPIC_API_KEY)
3. Vérifier le build local: `npm run build`
4. Revenir à la version précédente si nécessaire

### Problème: "Cannot push to remote"

```bash
# Récupérer les changements distants
git pull --rebase origin main

# Puis pousser
git push origin main
```

---

## Ressources

- [Semantic Versioning](https://semver.org/)
- [Git Tagging Documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [GitHub Repository](https://github.com/benoitgit72/synccv)

---

**Dernière mise à jour**: 2026-01-22
**Maintenu par**: Claude Code + Benoit Gaulin
