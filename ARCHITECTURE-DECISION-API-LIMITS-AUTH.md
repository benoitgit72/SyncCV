# Architecture Decision: JWT Auth vs Service Role Key

## 🎯 Décision Finale: Utiliser JWT Token (comme les autres endpoints)

### ✅ Approche Retenue

Les endpoints `/api/admin/get-api-limits` et `/api/admin/update-api-limits` utilisent maintenant:
- **SUPABASE_ANON_KEY** (clé publique)
- **Token JWT de l'utilisateur** passé via Authorization header
- **RLS Policies** pour vérifier que `auth.uid()` est admin

### ❌ Approche Initiale (Rejetée)

L'implémentation initiale utilisait:
- **SUPABASE_SERVICE_ROLE_KEY** (clé secrète)
- Bypass complet de RLS
- Variable d'environnement sensible à configurer dans Vercel

## 🤔 Pourquoi le Changement?

### Problème avec Service Role Key

1. **Risque de Sécurité**
   - Service role key = accès COMPLET à la database
   - Bypass toutes les RLS policies
   - Si exposée accidentellement = catastrophe
   - Nécessite configuration Vercel supplémentaire

2. **Incohérence avec le Reste du Code**
   ```javascript
   // Autres endpoints admin (communication, etc.)
   const supabase = getSupabaseClient(); // Utilise ANON key
   const { data } = await supabase.from('table').select('*');
   // ✅ Fonctionne via RLS + JWT

   // Ancien code API limits
   const supabase = createClient(URL, SERVICE_ROLE_KEY);
   // ❌ Différent, inutilement complexe
   ```

3. **Pas Nécessaire**
   - Les RLS policies que nous avons créées permettent déjà aux admins d'accéder
   - `auth.uid()` dans les policies identifie l'utilisateur via son JWT
   - Aucune raison de bypasser RLS ici

### Solution: Utiliser JWT comme Partout Ailleurs

```javascript
// api/admin/get-api-limits.js (nouveau)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
        headers: {
            Authorization: `Bearer ${token}` // Token de l'admin
        }
    }
});

// Supabase va:
// 1. Vérifier que le token est valide
// 2. Extraire le user_id du token
// 3. Utiliser auth.uid() dans les RLS policies
// 4. Permettre l'accès si is_admin = true
```

## 📊 Comparaison

| Aspect | Service Role Key | JWT Token |
|--------|-----------------|-----------|
| **Sécurité** | ❌ Très risqué si exposé | ✅ Risque limité (expirable) |
| **Configuration** | ❌ Variable Vercel nécessaire | ✅ Rien à configurer |
| **Cohérence** | ❌ Pattern différent | ✅ Même pattern que le reste |
| **RLS** | ❌ Bypasse tout | ✅ Utilise les policies |
| **Maintenance** | ❌ Code spécial | ✅ Code standard |
| **Rotation clés** | ❌ Complexe | ✅ Automatique |

## 🔐 Comment Ça Fonctionne

### 1. Authentification Admin (Côté Client)

```javascript
// admin_website/js/api-limits.js
const supabase = getSupabaseClient(); // ANON key
const session = await supabase.auth.getSession();
const token = session.data.session.access_token;

// Envoyer le token au backend
const response = await fetch('/api/admin/get-api-limits', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### 2. Vérification Backend

```javascript
// api/admin/get-api-limits.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
});

// Vérifier que l'utilisateur est admin
const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

if (!profile.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
}
```

### 3. RLS Policies (Supabase)

```sql
CREATE POLICY "Admins can view all api limits"
    ON api_limits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()  -- JWT user_id
            AND profiles.is_admin = true
        )
    );
```

## ✅ Avantages de l'Approche JWT

1. **Zéro Configuration Vercel**
   - Pas besoin d'ajouter `SUPABASE_SERVICE_ROLE_KEY`
   - Fonctionne out-of-the-box

2. **Sécurité par Défaut**
   - RLS policies appliquées
   - Tokens JWT expirables (1 heure)
   - Pas de clé secrète à protéger

3. **Audit Trail Précis**
   - `updated_by` dans `api_limits` contient le vrai user_id
   - Historique traçable par utilisateur
   - Impossible avec service role (serait toujours le même "système")

4. **Code Maintenable**
   - Même pattern que communication.js, statistics.js, etc.
   - Facile à comprendre pour les développeurs
   - Pas de cas spécial

## 🚫 Quand Utiliser Service Role Key?

Utilisez `SUPABASE_SERVICE_ROLE_KEY` **uniquement** pour:

1. **Opérations système autonomes**
   - Cron jobs
   - Migrations automatiques
   - Cleanup tasks

2. **Opérations qui doivent bypasser RLS intentionnellement**
   - Admin ultra-root qui peut tout voir
   - Scripts de maintenance

3. **APIs publiques sans authentification utilisateur**
   - Webhooks externes
   - Intégrations tier-party

**Notre cas (API Limits)** ne correspond à **aucun** de ces scénarios!

## 📝 Conclusion

L'utilisation du **JWT token** est:
- ✅ Plus sûre
- ✅ Plus simple
- ✅ Plus cohérente
- ✅ Mieux documentée (audit trail)

**Aucune raison** d'utiliser le service role key pour cette fonctionnalité.

---

**Commit**: `5b0ca6e` - Refactor to use JWT auth instead of service role key
**Date**: 2026-01-26
