# Shakederoy 🍹

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tests

Ce projet inclut une suite complète de tests unitaires avec **Jest** et **React Testing Library**.

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch (re-exécution automatique)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

### Couverture

✅ **72 tests unitaires** couvrant :
- Composants UI (Button, Input, CocktailCard)
- Utilitaires API (apiFetch)
- Contexte d'authentification (AuthContext)
- **Endpoints API backend complets** (cocktails, authentification, tokens, erreurs)

📖 Voir [TESTS.md](TESTS.md) pour plus de détails

### CI/CD

Les tests s'exécutent automatiquement via GitHub Actions à chaque push sur `main`, `master`, `develop`. Le workflow :
- Vérifie le linting
- Exécute tous les tests
- Génère un rapport de couverture
- Build le projet

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
