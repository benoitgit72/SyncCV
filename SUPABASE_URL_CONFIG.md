# Configuration des URLs de redirection Supabase

## Problème

Lorsque vous cliquez sur "Mot de passe oublié", le lien de réinitialisation redirige vers `http://localhost:3000` au lieu de votre domaine de production.

## Solution

Vous devez configurer les URLs autorisées dans Supabase Dashboard.

## Étapes de configuration

### 1. Accéder à la configuration Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet: **btcdbewqypejzmlwwedz**
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Cliquez sur **URL Configuration**

### 2. Configurer les URLs

Dans la section **Redirect URLs**, ajoutez les URLs suivantes:

#### Site URLs
```
https://synccv.vercel.app
```

#### Redirect URLs (une par ligne)
```
https://synccv.vercel.app/**
https://synccv.vercel.app/admin_cv/reset-password.html
http://localhost:3000/**
http://localhost:3000/admin_cv/reset-password.html
```

**Note**: Les URLs avec `**` permettent d'autoriser tous les chemins sous ce domaine.

### 3. Configurer l'URL du site (Site URL)

Dans la section **Site URL**, assurez-vous que l'URL est:
```
https://synccv.vercel.app
```

Cette URL est utilisée comme fallback si aucune URL de redirection n'est spécifiée.

### 4. Sauvegarder

Cliquez sur **Save** pour enregistrer les modifications.

## Vérification

Après avoir configuré les URLs:

1. Retournez sur `https://synccv.vercel.app/admin_cv`
2. Cliquez sur "Mot de passe oublié"
3. Entrez votre email: `benoit4ai@gmail.com`
4. Vérifiez votre email
5. Cliquez sur le lien "Reset Password"
6. Vous devriez maintenant être redirigé vers `https://synccv.vercel.app/admin_cv/reset-password.html`

## Fichiers créés

- `admin_cv/reset-password.html` - Page de réinitialisation du mot de passe
- La page permet de:
  - Entrer un nouveau mot de passe
  - Confirmer le mot de passe
  - Réinitialiser et rediriger vers la page de connexion

## Notes importantes

- Les liens de réinitialisation expirent après un certain temps (généralement 1 heure)
- Si le lien est expiré, vous devrez demander un nouveau lien de réinitialisation
- Pour des raisons de sécurité, Supabase nécessite que les URLs de redirection soient explicitement autorisées

## En cas de problème

Si vous avez toujours des problèmes après la configuration:

1. Vérifiez que les URLs sont exactement comme indiqué (sans espaces)
2. Assurez-vous d'avoir cliqué sur "Save"
3. Attendez quelques secondes pour que la configuration soit propagée
4. Essayez à nouveau le processus de réinitialisation

## Support

Si vous avez besoin d'aide supplémentaire, consultez la documentation Supabase:
https://supabase.com/docs/guides/auth/redirect-urls
