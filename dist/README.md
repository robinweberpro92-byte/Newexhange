# NovaBridge Front

Front React + Vite, sombre et premium, pensé pour une démo de type exchange crypto.

## Ce que contient le projet

- landing page premium
- page exchange
- page market
- dashboard
- page transactions
- login démo
- admin panel local pour changer branding, PayPal, wallets et frais
- persistance via `localStorage`
- build statique simple, sans Prisma

## Pourquoi ce projet évite les galères Vercel

- aucune dépendance Prisma
- aucun backend requis pour le build
- build purement statique via Vite
- `vercel.json` inclus pour les routes SPA

## Installation

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

Le build sort dans `dist/`.

## Déploiement Vercel

Le projet est prêt pour un déploiement statique. Le fichier `vercel.json` contient déjà le rewrite SPA vers `index.html`.

## Où changer rapidement les valeurs

### Sans code

- va sur `/login`
- connecte-toi avec `admin@novabridge.dev` / `demo1234`
- ouvre `/admin`
- change le branding, le PayPal, les wallets, les frais

### Dans le code

- `src/config/defaultConfig.js`

## API plus tard

Si tu veux brancher une vraie API ensuite, commence par remplacer les mocks dans:

- `src/data/market.js`
- `src/data/transactions.js`

Puis ajoute tes appels dans tes propres services. Le build front restera simple.

## Variables d'environnement

Voir `.env.example`.

- `VITE_API_BASE_URL`
- `VITE_ENABLE_REMOTE_API`

## Notes importantes

L'admin actuel est une démo front uniquement. Il ne sécurise rien côté serveur. Pour une vraie prod, branche ton backend et ta vraie auth.
