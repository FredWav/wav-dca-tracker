/**
 * Utility functions for fetching and managing price data.
 *
 * The Wav DCA Tracker uses CoinGecko's public API to retrieve
 * current prices for supported assets. You can extend the
 * `priceIds` object below to add new assets and their corresponding
 * CoinGecko IDs. For tokens that don't have a public price (e.g. presales),
 * you can pass a `manual` object to `fetchPrices` with overrides.
 */

export const priceIds = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  SUI: 'sui',
  HYPE: 'hyperliquid',
  // Add additional mappings here as needed.
};

/**
 * Fetches current EUR prices for a list of assets using CoinGecko.
 *
 * @param {string[]} assets A list of asset symbols (e.g. ['BTC', 'ETH']).
 * @param {Record<string, number>} manual A map of asset symbols to prices
 *        that should override any API response (useful for presale tokens).
 * @returns {Promise<Record<string, number>>} A map of asset symbol to current EUR price.
 */
export async function fetchPrices(assets, manual = {}) {
  const ids = assets
    .map((asset) => priceIds[asset])
    .filter(Boolean);
  const prices = {};
  if (ids.length > 0) {
    try {
      const query = ids.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${query}&vs_currencies=eur`;
      const res = await fetch(url);
      const data = await res.json();
      assets.forEach((asset) => {
        const id = priceIds[asset];
        if (id && data[id] && data[id].eur !== undefined) {
          prices[asset] = data[id].eur;
        }
      });
    } catch (err) {
      console.error('Failed to fetch prices from CoinGecko:', err);
    }
  }
  // Apply manual overrides (e.g. presale tokens)
  for (const asset of Object.keys(manual)) {
    prices[asset] = manual[asset];
  }
  return prices;
}