# StockFlow — Frontend (React)

Frontend de l'application de gestion de stock, construit avec **React + Vite +
React Router + Recharts**. Il fonctionne actuellement avec une **API simulée**
(stockée dans `localStorage`) qui reproduit exactement le modèle de données du
document d'architecture (`users`, `categories`, `articles`,
`type_mouvements`, `mouvements_stock`), afin d'être branché plus tard sur le
backend Laravel sans changer les composants.

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:5173.

**Compte de démonstration** : `admin@stockflow.test` / `admin123`
(voir aussi `fatou@stockflow.test` / `admin123`).

Les données (catégories, articles, mouvements) sont pré-remplies au premier
lancement et persistées dans le `localStorage` du navigateur. Pour repartir de
zéro, exécutez dans la console du navigateur :

```js
localStorage.removeItem("stockflow_mock_db_v1");
localStorage.removeItem("stockflow_session_v1");
```

## Structure du projet

```
src/
  api/            → couche d'accès aux données (à remplacer par des appels Laravel)
    mockDb.js         seed + persistance localStorage
    authApi.js         login / logout / session
    categoriesApi.js   CRUD catégories
    articlesApi.js      CRUD articles + recherche + filtres + alertes stock
    movementsApi.js     entrées/sorties + historique + mise à jour du stock
    dashboardApi.js     statistiques + données des graphiques
  context/
    AuthContext.jsx     utilisateur connecté
    ToastContext.jsx    notifications
  components/          composants réutilisables (Layout, Sidebar, Modal, StockBar...)
  pages/               une page par écran du cahier des charges
  routes/
    ProtectedRoute.jsx  redirige vers /connexion si non authentifié
```

## Fonctionnalités couvertes (cahier des charges)

- **Authentification** : connexion / déconnexion, routes protégées, chaque
  mouvement de stock est associé à l'utilisateur connecté.
- **Catégories** : ajouter / modifier / supprimer / lister / rechercher.
- **Articles** : ajouter / modifier / supprimer / consulter / rechercher /
  filtrer par catégorie / filtrer par statut de stock (rupture, faible).
- **Entrées de stock** : incrémentent `stock_actuel`.
- **Sorties de stock** : décrémentent `stock_actuel`, avec blocage si la
  quantité dépasse le stock disponible.
- **Historique des mouvements** : liste filtrable (type, article), avec
  article, type, quantité, date, motif, utilisateur.
- **Dashboard** : statistiques (articles, catégories, entrées, sorties,
  valeur du stock, ruptures, stock faible) + 2 graphiques (entrées/sorties
  sur 7 jours, stock par catégorie).
- **Rapports** : rapport imprimable des catégories et articles disponibles
  (bouton "Imprimer / Exporter en PDF" → boîte de dialogue d'impression du
  navigateur, avec mise en page dédiée `@media print`).

## Brancher le backend Laravel

Chaque fichier `src/api/*.js` isole toute la logique de données derrière des
fonctions `async`. Pour connecter le vrai backend Laravel :

1. Créer `src/api/http.js` avec un client `fetch`/`axios` pointant vers votre
   API (`VITE_API_URL`), incluant le token/cookie de session Laravel Sanctum.
2. Remplacer le corps de chaque fonction (`listArticles`, `createCategory`,
   `registerMovement`, etc.) par l'appel HTTP correspondant — les signatures
   d'entrée/sortie ont été pensées pour matcher les routes API REST
   suggérées dans le document d'architecture (`GET /api/articles`,
   `POST /api/mouvements`, etc.). Chaque fichier contient déjà un commentaire
   indiquant la route Laravel équivalente.
3. Supprimer `mockDb.js` une fois la migration terminée.

Aucun composant React n'a besoin d'être modifié : ils consomment déjà une
interface asynchrone identique à ce que renverra l'API Laravel.
