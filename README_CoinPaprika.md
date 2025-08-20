# Addon CoinPaprika – Wav DCA Tracker

Ce paquet ajoute une intégration **CoinPaprika** (gratuite, sans clé) à un projet Next.js (App Router).

## Fichiers inclus
- `src/lib/pricing/coinpaprika.ts` — client CoinPaprika avec cache (24h pour le mapping symbol->coin_id, 60s pour les prix)
- `src/app/api/prices/route.ts` — route API POST `/api/prices` (batch)
- `src/app/prices-test/page.tsx` — page de test basique

## Installation

1. Copie les fichiers dans ton repo :
   - `src/lib/pricing/coinpaprika.ts`
   - `src/app/api/prices/route.ts`
   - (optionnel) `src/app/prices-test/page.tsx`

2. Build & run (Vercel/Local) — aucune dépendance ni variable d’environnement à ajouter.

## Utilisation

**Requête (client) :**
```ts
await fetch("/api/prices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    symbols: ["BTC","ETH","SOL","SHIB"],
    quote: "EUR", // ou "USD"
    quantities: { BTC: 0.12, ETH: 1.8, SOL: 30, SHIB: 12_000_000 }
  })
})
```

**Réponse :**
```json
{
  "quote": "EUR",
  "rows": [
    { "symbol": "BTC", "coinId": "btc-bitcoin", "price": 60000.1, "qty": 0.12, "total": 7200.012 },
    ...
  ],
  "portfolioValue": 99999.99,
  "cached": true
}
```

## Notes
- L’appel `/v1/coins` de CoinPaprika est volumineux; il est **mis en cache 24h** côté serveur.
- Les prix sont mis en cache **60s** côté serveur, ce qui limite la charge API et accélère les requêtes.
- Si tu veux un fallback Binance -> Paprika, ajoute une couche avant `getPricesForSymbols` qui tente Binance en priorité.
