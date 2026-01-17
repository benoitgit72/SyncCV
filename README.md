# CV Interactif de Benoit Gaulin

Un site web de CV moderne et interactif construit en HTML, CSS et JavaScript vanilla.

## Aperçu

Ce projet présente mon expérience professionnelle, mes compétences techniques et ma formation de manière interactive et visuellement attrayante. Le site est entièrement responsive et optimisé pour tous les appareils.

## Caractéristiques

- **Design Moderne**: Interface élégante avec dégradés, animations et effets de survol
- **Responsive**: S'adapte parfaitement aux mobiles, tablettes et ordinateurs
- **Interactif**: Animations au scroll, compteurs animés, barres de progression
- **Navigation fluide**: Scroll smooth avec navigation fixe
- **Performance**: Code optimisé sans dépendances externes
- **Accessible**: Conforme aux standards d'accessibilité web

## Structure du Projet

```
Benoit-Gaulin-CV/
├── index.html          # Structure HTML du site
├── styles.css          # Styles CSS et animations
├── script.js           # Fonctionnalités JavaScript
├── README.md           # Documentation
├── Benoit-Gaulin-CV_venv/  # Environnement virtuel Python
├── data/               # Données (à remplir si nécessaire)
├── logs/               # Logs de l'application
├── modules/            # Modules personnalisés
├── prompts/            # Prompts pour IA
└── scripts/            # Scripts utilitaires
```

## Sections du Site

1. **Accueil (Hero)**: Présentation avec appel à l'action
2. **À propos**: Résumé professionnel avec statistiques animées
3. **Expérience**: Timeline interactive des expériences professionnelles
4. **Formation**: Certifications et formations avec SAS Institute
5. **Compétences**: Barres de progression animées par catégorie
6. **Contact**: Formulaire de contact et informations

## Technologies Utilisées

- **HTML5**: Structure sémantique
- **CSS3**:
  - Variables CSS pour la personnalisation
  - Flexbox et Grid pour la mise en page
  - Animations et transitions
  - Media queries pour la responsivité
- **JavaScript Vanilla**:
  - Intersection Observer API pour les animations au scroll
  - Event listeners pour l'interactivité
  - Navigation dynamique

## Installation et Utilisation

### Option 1: Ouvrir directement dans le navigateur

```bash
cd /Users/macbook-air.dev/Benoit-Gaulin-CV
open index.html
```

Ou double-cliquez simplement sur `index.html` dans le Finder.

### Option 2: Serveur local Python

```bash
# Activer l'environnement virtuel
source Benoit-Gaulin-CV_venv/bin/activate

# Démarrer un serveur HTTP simple
python -m http.server 8000

# Ouvrir dans le navigateur
open http://localhost:8000
```

### Option 3: Serveur local avec Node.js (si installé)

```bash
# Installer http-server globalement (une seule fois)
npm install -g http-server

# Démarrer le serveur
http-server -p 8000

# Ouvrir dans le navigateur
open http://localhost:8000
```

### Option 4: Live Server (VS Code)

1. Installer l'extension "Live Server" dans VS Code
2. Clic droit sur `index.html`
3. Sélectionner "Open with Live Server"

## Personnalisation

### Modifier les Couleurs

Dans [styles.css](styles.css), modifiez les variables CSS dans `:root`:

```css
:root {
    --primary-color: #4a90e2;
    --secondary-color: #2ecc71;
    --dark-bg: #1a1a2e;
    /* ... autres variables ... */
}
```

### Ajouter du Contenu

1. **Ajouter une expérience**: Dupliquez un bloc `.timeline-item` dans [index.html](index.html)
2. **Ajouter une compétence**: Ajoutez un `.skill-item` dans la section appropriée
3. **Modifier les statistiques**: Changez les attributs `data-target` dans `.stat-number`

### Ajouter une Photo de Profil

Remplacez le placeholder SVG dans la section hero par:

```html
<div class="hero-image">
    <img src="path/to/your/photo.jpg" alt="Benoit Gaulin" style="border-radius: 50%; max-width: 400px;">
</div>
```

## Fonctionnalités JavaScript

- **Navigation active**: Surligne automatiquement la section visible
- **Compteurs animés**: Incrémentation progressive des statistiques
- **Barres de progression**: Animation des compétences au scroll
- **Parallax léger**: Effet de profondeur sur le hero
- **Back to top**: Bouton de retour en haut de page
- **Formulaire de contact**: Validation et message de confirmation

## Optimisation

### Performance

- Code minifié pour la production
- Images optimisées (si ajoutées)
- Lazy loading des ressources
- Animations GPU-accelerated

### SEO

- Balises meta appropriées
- Structure sémantique HTML5
- Attributs alt sur les images
- Schema.org markup (à ajouter si besoin)

## Déploiement

### GitHub Pages

```bash
# Initialiser le repo git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit: Interactive CV"

# Créer un repo sur GitHub et pousser
git remote add origin https://github.com/votre-username/benoit-gaulin-cv.git
git push -u origin main

# Activer GitHub Pages dans les paramètres du repo
# Le site sera disponible à: https://votre-username.github.io/benoit-gaulin-cv
```

### Netlify

1. Créer un compte sur [Netlify](https://netlify.com)
2. Glisser-déposer le dossier du projet
3. Le site sera automatiquement déployé

### Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
cd /Users/macbook-air.dev/Benoit-Gaulin-CV
vercel
```

## Améliorations Futures Possibles

- [ ] Ajouter un mode sombre/clair (déjà préparé dans le code)
- [ ] Intégrer un backend pour le formulaire de contact
- [ ] Ajouter une section portfolio avec projets
- [ ] Implémenter le téléchargement de CV en PDF
- [ ] Ajouter des animations plus avancées (GSAP, Three.js)
- [ ] Multilingue (FR/EN)
- [ ] Blog intégré
- [ ] Tests automatisés

## Support Navigateur

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Opera (dernières versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Licence

© 2024 Benoit Gaulin. Tous droits réservés.

## Contact

Pour toute question concernant ce projet:

- Email: benoit.gaulin@example.com
- LinkedIn: [Votre profil LinkedIn]
- GitHub: [Votre profil GitHub]

---

Construit avec ❤️ en HTML, CSS et JavaScript vanilla
