/**
 * Helper functions to compute investment metrics.
 *
 * These helpers operate on an array of transaction objects. A transaction has
 * the shape:
 *   {
 *     date: 'YYYY-MM-DD',
 *     platform: 'Crypto.com' | 'Bitget' | ...,
 *     asset: 'BTC' | 'ETH' | ...,
 *     type: 'BUY' | 'SELL',
 *     price: number,        // price per unit in EUR
 *     quantity: number      // number of units bought or sold
 *   }
 *
 * The functions below assume dates are ISO strings and rely on the order
 * of transactions to compute FIFO for realized gains/losses.
 */

/**
 * Computes per‑asset realised/unrealised PnL, invested capital, and
 * other metrics using FIFO cost basis.
 *
 * @param {Array} transactions List of transaction objects.
 * @param {Record<string, number>} prices Current price per asset (EUR).
 * @returns {Record<string, object>} A map keyed by asset symbol containing
 *          quantity, invested, currentPrice, value, realised, unrealised,
 *          total PnL, average cost, and PnL percentage.
 */
export function computePnL(transactions = [], prices = {}) {
  const result = {};
  const lotsByAsset = {};
  const realisedByAsset = {};

  // Sort transactions chronologically to correctly apply FIFO when selling
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const tx of sorted) {
    const { asset, type, price, quantity } = tx;
    if (!lotsByAsset[asset]) lotsByAsset[asset] = [];
    if (!realisedByAsset[asset]) realisedByAsset[asset] = 0;

    if (type === 'BUY') {
      // Add a new purchase lot
      lotsByAsset[asset].push({ quantity, price });
    } else if (type === 'SELL') {
      // Remove from purchase lots using FIFO and compute realised PnL
      let qtyToSell = quantity;
      const lots = lotsByAsset[asset];
      while (qtyToSell > 0 && lots.length > 0) {
        const lot = lots[0];
        const sellQty = Math.min(lot.quantity, qtyToSell);
        realisedByAsset[asset] += sellQty * (price - lot.price);
        lot.quantity -= sellQty;
        qtyToSell -= sellQty;
        if (lot.quantity <= 1e-8) {
          lots.shift();
        }
      }
      // If there are not enough lots (e.g. user sells more than they own), the
      // remainder is ignored. In a real app you'd want to handle this better.
    }
  }

  // Build summary for each asset based on remaining lots
  for (const asset of Object.keys(lotsByAsset)) {
    const lots = lotsByAsset[asset];
    const totalQty = lots.reduce((sum, lot) => sum + lot.quantity, 0);
    const invested = lots.reduce((sum, lot) => sum + lot.quantity * lot.price, 0);
    const currentPrice = prices[asset] ?? 0;
    const value = currentPrice * totalQty;
    const realised = realisedByAsset[asset] ?? 0;
    const unrealised = value - invested;
    const pnl = realised + unrealised;
    const costAvg = totalQty > 0 ? invested / totalQty : 0;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : null;
    result[asset] = {
      quantity: totalQty,
      invested,
      currentPrice,
      value,
      realised,
      unrealised,
      pnl,
      costAvg,
      pnlPercent,
    };
  }
  return result;
}

/**
 * Aggregates totals across all assets in a summary produced by `computePnL`.
 *
 * @param {Record<string, object>} summary Map returned from computePnL.
 * @returns {Object} Totals for invested capital, current value, realised,
 *          unrealised, and total PnL across the whole portfolio.
 */
export function computeTotals(summary = {}) {
  let invested = 0;
  let value = 0;
  let realised = 0;
  let unrealised = 0;
  let pnl = 0;
  for (const asset of Object.keys(summary)) {
    const s = summary[asset];
    invested += s.invested;
    value += s.value;
    realised += s.realised;
    unrealised += s.unrealised;
    pnl += s.pnl;
  }
  return { invested, value, realised, unrealised, pnl };
}

/**
 * Computes an approximate month‑by‑month history of the portfolio. This
 * implementation uses current prices for every month, so it's a rough
 * approximation intended primarily for visualisation. For real historical
 * analysis you'd fetch historical prices per date.
 *
 * The monthly return is estimated as the change in total portfolio value
 * (including realised profits) minus new capital contributions, divided by
 * the previous portfolio value. Returns are expressed as a fraction (e.g. 0.05
 * for +5%).
 *
 * @param {Array} transactions List of transactions.
 * @param {Record<string, number>} prices Current price per asset.
 * @returns {Array<{month: string, invested: number, value: number, realised: number, unrealised: number, pnl: number, return: number}>}
 */
export function computeMonthlyHistory(transactions = [], prices = {}) {
  // Determine the set of months present in the transactions (YYYY‑MM)
  const months = Array.from(
    new Set(transactions.map((tx) => tx.date.slice(0, 7)))
  ).sort();
  const history = [];
  let prevPortfolioValue = 0;
  let prevInvested = 0;
  for (const month of months) {
    // All transactions up to and including this month
    const uptoMonth = transactions.filter(
      (tx) => tx.date.slice(0, 7) <= month
    );
    const summary = computePnL(uptoMonth, prices);
    const totals = computeTotals(summary);
    // Portfolio value includes current holdings value plus realised PnL
    const portfolioValue = totals.value + totals.realised;
    // New capital contributions this period: invested increase since last month
    const newContrib = totals.invested - prevInvested;
    let periodReturn = 0;
    if (prevPortfolioValue > 0) {
      // TWR approximation: (value change - net contributions) / prev value
      periodReturn = (portfolioValue - prevPortfolioValue - newContrib) / prevPortfolioValue;
    }
    history.push({
      month,
      invested: totals.invested,
      value: totals.value,
      realised: totals.realised,
      unrealised: totals.unrealised,
      pnl: totals.pnl,
      return: periodReturn * 100,
    });
    prevPortfolioValue = portfolioValue;
    prevInvested = totals.invested;
  }
  return history;
}