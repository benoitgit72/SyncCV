# Déploiement du Système de Gestion des Limites API

## 📋 Vue d'ensemble

Système complet pour gérer les limites d'utilisation des 5 fonctionnalités utilisant l'API Claude:
1. **Chatbot** (CV publique)
2. **Traduction** (Admin CV)
3. **Générateur de Statistiques** (Admin CV)
4. **Évaluation de Compatibilité** (Fit Assessment)
5. **Suggestion de Tags** (Admin CV)

## 🚀 Étapes de Déploiement

### Étape 1: Migration de la Base de Données (CRITIQUE - À FAIRE EN PREMIER)

1. Ouvrir **Supabase Dashboard**: https://supabase.com/dashboard
2. Naviguer vers votre projet **SyncCV**
3. Aller dans **SQL Editor**
4. Copier et exécuter le contenu de `/supabase-api-limits-migration.sql`
5. Vérifier que la migration a réussi:

```sql
-- Vérifier que les tables existent
SELECT * FROM api_limits;
SELECT * FROM api_limits_history;

-- Devrait retourner 5 lignes (chatbot, translate, statistics, fit_assessment, suggest_tags)
SELECT count(*) FROM api_limits;
```

**Résultat attendu**: 5 fonctionnalités configurées avec leurs limites par défaut:
- **chatbot**: 4/min, 10/h, 15/jour (par IP)
- **translate**: 4/min, 10/h, 15/jour (par IP)
- **statistics**: 3/min, 10/h, 20/jour (par user_id)
- **fit_assessment**: 2/min, 5/h, 5/jour (par IP)
- **suggest_tags**: 4/min, 10/h, 15/jour (par IP)

---

### Étape 2: Vérifier les Variables d'Environnement Vercel

**⚡ Note**: Les endpoints API Limits utilisent le **token JWT de l'admin** (pas de service role key nécessaire). Aucune variable d'environnement supplémentaire requise!

Si vous voulez quand même vérifier:
1. Aller dans **Vercel Dashboard** → Votre projet **SyncCV**
2. **Settings** → **Environment Variables**
3. Les variables standards devraient suffire:
   - `ANTHROPIC_API_KEY` ✅ (pour Claude API)
   - `SUPABASE_URL` ✅ (optionnel, valeur par défaut en place)
   - `SUPABASE_ANON_KEY` ✅ (optionnel, valeur par défaut en place)

---

### Étape 3: Déployer sur Vercel

Les commits ont déjà été créés. Il suffit de pousser vers GitHub:

```bash
git push origin main
```

Vercel va automatiquement détecter les changements et déployer:
- ✅ Nouveaux endpoints API (`/api/admin/get-api-limits`, `/api/admin/update-api-limits`)
- ✅ Utilitaire de cache (`/api/_utils/get-rate-limits.js`)
- ✅ Interface admin mise à jour
- ✅ Tous les endpoints API modifiés

**Temps de déploiement**: ~2-3 minutes

---

## ✅ Tests Post-Déploiement

### Test 1: Vérifier la Migration Database

**Dans Supabase SQL Editor:**

```sql
-- Afficher toutes les limites configurées
SELECT
    feature_name,
    feature_label_fr,
    limit_per_minute,
    limit_per_hour,
    limit_per_day,
    is_enabled,
    rate_limit_by
FROM api_limits
ORDER BY feature_name;
```

**Résultat attendu:** Table avec 5 lignes, limites correctes.

---

### Test 2: Accès Admin Panel

1. **Connexion**: Aller sur `https://synccv.vercel.app/admin_website/`
2. Se connecter avec votre compte admin
3. Cliquer sur **"Limites API"** dans la sidebar (premier élément)

**Résultat attendu:**
- ✅ Section affiche 5 cartes de fonctionnalités
- ✅ Chaque carte montre les limites actuelles (minute/heure/jour)
- ✅ Inputs éditables avec valeurs chargées depuis la DB
- ✅ Bouton "Enregistrer" sur chaque carte
- ✅ Section "Historique des modifications" en bas (vide au début)

---

### Test 3: Modifier une Limite

1. Dans la section **Limites API**, trouver la carte **"Chatbot (CV publique)"**
2. Changer **"Par minute"** de `4` à `5`
3. Cliquer sur **"💾 Enregistrer"**

**Résultat attendu:**
- ✅ Toast de succès: "✅ Limites mises à jour avec succès!"
- ✅ Bouton revient à l'état normal
- ✅ Section "Historique" se rafraîchit automatiquement
- ✅ Nouvelle ligne dans l'historique montre: `4 → 5` pour "Par minute"

**Vérification dans Supabase:**

```sql
-- Vérifier que la limite a été mise à jour
SELECT limit_per_minute, limit_per_hour, limit_per_day, updated_at
FROM api_limits
WHERE feature_name = 'chatbot';

-- Vérifier l'historique
SELECT * FROM api_limits_history
WHERE feature_name = 'chatbot'
ORDER BY changed_at DESC
LIMIT 1;
```

---

### Test 4: Tester le Rate Limiting en Action

#### Test 4A: Chatbot (CV Publique)

1. Aller sur un CV publique: `https://synccv.vercel.app/ron-more`
2. Ouvrir le chatbot (icône 💬)
3. Envoyer **5 messages rapidement** (spam)

**Résultat attendu après 5 messages:**
```
❌ Trop de requêtes. Veuillez réessayer dans X minutes.
```

**Vérification que les limites dynamiques fonctionnent:**
1. Retourner dans Admin → Limites API
2. Changer **Chatbot** limite par minute à `10`
3. Enregistrer
4. Retourner sur le CV publique
5. Essayer d'envoyer 6 messages → Devrait fonctionner maintenant!

#### Test 4B: Traduction (Admin CV)

1. Aller dans Admin CV → **Expériences**
2. Ajouter une nouvelle expérience en français
3. Cliquer sur **"Traduire"** 5 fois rapidement

**Résultat attendu:** Après la 4ème traduction, message d'erreur de rate limit.

#### Test 4C: Générateur de Statistiques

1. Aller dans Admin CV → **Informations personnelles**
2. Scroller jusqu'à la section **"📊 Statistiques du CV"**
3. Cliquer sur **"🔄 Régénérer"** plusieurs fois rapidement

**Résultat attendu:** Après 3 clics, message d'erreur de rate limit.

---

### Test 5: Limite Illimitée (NULL)

1. Dans Admin → Limites API, trouver **"Chatbot"**
2. **Supprimer complètement** la valeur dans **"Par minute"** (laisser vide)
3. Cliquer sur **"💾 Enregistrer"**

**Résultat attendu:**
- ✅ Limite enregistrée comme `NULL` (illimité)
- ✅ Chatbot accepte maintenant un nombre illimité de requêtes par minute

**Vérification:**

```sql
SELECT limit_per_minute FROM api_limits WHERE feature_name = 'chatbot';
-- Devrait retourner NULL
```

**Test:** Essayer d'envoyer 20 messages sur le chatbot → Devrait tous passer!

**⚠️ Important:** Remettre la limite à `4` après le test pour éviter les abus.

---

### Test 6: Cache Invalidation

**Objectif:** Vérifier que le cache de 5 minutes est bien invalidé après une modification.

1. Envoyer 3 messages sur le chatbot (proche de la limite de 4)
2. Dans Admin, changer la limite à `10`
3. Enregistrer
4. **Immédiatement** retourner sur le chatbot
5. Envoyer 5 messages supplémentaires

**Résultat attendu:**
- ✅ Tous les messages passent (cache a été vidé, nouvelle limite de 10 est appliquée)

Si les messages sont bloqués, le cache n'a pas été vidé correctement.

---

### Test 7: Historique des Modifications

1. Modifier plusieurs limites (ex: chatbot, translate, statistics)
2. Aller dans la section **"📜 Historique des modifications"**

**Résultat attendu:**
- ✅ Tableau affiche toutes les modifications récentes
- ✅ Colonnes: Date, Fonctionnalité, Anciennes valeurs, Nouvelles valeurs, Modifié par
- ✅ Anciennes valeurs en rouge barré: ~~4~~
- ✅ Nouvelles valeurs en vert: **10**
- ✅ Maximum 20 dernières modifications affichées

**Vérification dans Supabase:**

```sql
SELECT
    feature_name,
    old_limit_per_minute,
    new_limit_per_minute,
    changed_at,
    changed_by
FROM api_limits_history
ORDER BY changed_at DESC
LIMIT 10;
```

---

## 🔧 Dépannage

### Problème 1: "Chargement des limites..." ne se termine jamais

**Cause:** Erreur dans l'endpoint API ou problème d'authentification.

**Solution:**
1. Ouvrir la **Console du navigateur** (F12)
2. Vérifier les erreurs réseau dans l'onglet **Network**
3. Si erreur 401/403: Problème d'authentification admin
4. Si erreur 500: Vérifier les logs Vercel

### Problème 2: Les limites ne changent pas après modification

**Cause:** Cache non invalidé ou erreur dans l'endpoint update.

**Solution:**
1. Vérifier dans Supabase si la limite a bien été modifiée:
   ```sql
   SELECT * FROM api_limits WHERE feature_name = 'chatbot';
   ```
2. Si la DB n'a pas changé: Erreur dans l'API → Vérifier logs Vercel
3. Si la DB a changé mais les limites ne s'appliquent pas: Cache non vidé → Vérifier `clearLimitsCache()` dans `/api/_utils/get-rate-limits.js`

### Problème 3: Erreur "feature not found" dans l'historique

**Cause:** Nom de fonctionnalité dans `api_limits_history` ne correspond pas à `api_limits`.

**Solution:**
```sql
-- Vérifier les noms de features
SELECT DISTINCT feature_name FROM api_limits_history
WHERE feature_name NOT IN (SELECT feature_name FROM api_limits);
```

Si résultats retournés, il y a une incohérence. Supprimer ces lignes:
```sql
DELETE FROM api_limits_history
WHERE feature_name NOT IN (SELECT feature_name FROM api_limits);
```

---

## 📊 Monitoring

### Vérifier l'utilisation actuelle

**Dans Vercel Dashboard:**
- Functions → Voir le nombre d'appels par endpoint
- Logs → Rechercher "Rate limit exceeded" pour voir les IPs bloquées

**Dans Supabase:**

```sql
-- Voir les modifications récentes
SELECT * FROM api_limits_history
ORDER BY changed_at DESC
LIMIT 50;

-- Voir les limites actuelles
SELECT * FROM api_limits;
```

---

## 📝 Notes Importantes

1. **Cache de 5 minutes:** Les modifications de limites sont appliquées **immédiatement** après le vidage du cache, mais peuvent prendre jusqu'à 5 minutes si une requête est déjà en cours.

2. **Rate Limit par IP vs User ID:**
   - **Chatbot, Traduction, Fit Assessment, Suggest Tags**: Par adresse IP
   - **Générateur de Statistiques**: Par user_id (chaque utilisateur a son propre quota)

3. **Limites NULL (illimitées):**
   - Laisser un champ vide = limite illimitée
   - Utile pour le debugging ou pour des utilisateurs premium (à implémenter)

4. **Sécurité:**
   - Seuls les admins (`is_admin = true`) peuvent accéder aux endpoints de gestion
   - Token JWT vérifié sur chaque requête
   - RLS activé sur les tables Supabase

5. **Performance:**
   - Cache en mémoire (5 min) réduit les appels DB
   - Cleanup automatique des stores de rate limiting (toutes les heures)

---

## ✅ Checklist de Déploiement

- [ ] Migration database exécutée dans Supabase
- [ ] Variables d'environnement Vercel vérifiées
- [ ] Code pushé vers GitHub (`git push origin main`)
- [ ] Déploiement Vercel terminé (vert ✓)
- [ ] Admin panel accessible et section "Limites API" visible
- [ ] Test: Modifier une limite et vérifier le succès
- [ ] Test: Rate limiting fonctionne sur le chatbot
- [ ] Test: Historique affiche les modifications
- [ ] Test: Cache invalidé après modification
- [ ] Documentation partagée avec l'équipe

---

## 🎉 Succès!

Si tous les tests passent, le système de gestion des limites API est **100% fonctionnel**! 🚀

Vous pouvez maintenant:
- Ajuster les limites en temps réel sans redéploiement
- Suivre l'historique des modifications
- Réagir rapidement aux abus (augmenter/réduire les limites)
- Préparer le terrain pour un système de subscription premium (limites personnalisées par utilisateur)

---

**Questions?** Vérifiez les logs Vercel ou Supabase pour plus de détails sur les erreurs éventuelles.
