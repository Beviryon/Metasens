# Notes sur le développement

## Temps de travail
- **Fonctionnalités de base** : ~2 heures
  - CRUD des tâches
  - Système de filtres basique
  - Gestion des états des tâches

- **Fonctionnalités avancées** : ~2 heures 30
  - Authentification avec stockage local
  - Mode hors ligne et synchronisation
  - Filtres avancés et tri
  - Gestion des dates limites
  - Drag & drop pour la réorganisation

- **Améliorations UX/UI** : ~2 heures
  - Refonte du design pour plus de modernité
  - Animations et transitions
  - Notifications centrées avec codes couleur
  - Responsive design
  - Optimisation des interactions

**Temps total** : ~6 heures 30

## Remarques techniques

### Points forts
1. **Architecture**
   - Séparation claire des responsabilités
   - Code modulaire et maintenable
   - Utilisation des standards modernes (ES6+)

2. **UX/UI**
   - Interface intuitive et moderne
   - Retours visuels clairs pour chaque action
   - Support complet du mode sombre
   - Animations fluides et non intrusives

3. **Fonctionnalités**
   - Système complet de gestion des tâches
   - Mode hors ligne robuste
   - Synchronisation efficace
   - Filtres et tri avancés

# To-Do List Application
## Prérequis

- Node.js (version 14 ou supérieure)
- npm (gestionnaire de paquets Node.js)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/Beviryon/Metasens.git
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur :
```bash
node server.js
```

4. Ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

## Identifiants de connexion

Pour accéder à l'application, utilisez les identifiants suivants :

- **Nom d'utilisateur** : `Metasens`
- **Mot de passe** : `test`

## Technologies utilisées

- Frontend : HTML5, CSS3, JavaScript (ES6+)
- Backend : Node.js, Express.js
- Stockage : LocalStorage pour le mode hors ligne