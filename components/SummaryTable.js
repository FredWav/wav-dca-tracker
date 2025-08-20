import { computeTotals } from '../utils/finance';

/**
 * Displays a summary of positions per asset along with portfolio totals.
 *
 * @param {{ summary: Record<string, object> }} props
 */
export default function SummaryTable({ summary = {} }) {
  const totals = computeTotals(summary);
  const assetKeys = Object.keys(summary).sort();
  return (
    <div className="overflow-auto border rounded-lg">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Actif</th>
            <th>Quantité</th>
            <th>Prix moyen (€)</th>
            <th>Prix actuel (€)</th>
            <th>Investi (€)</th>
            <th>Valeur (€)</th>
            <th>Réal. (€)</th>
            <th>Non‑réal. (€)</th>
            <th>PnL (%)</th>
          </tr>
        </thead>
        <tbody>
          {assetKeys.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center py-4 text-gray-500">
                Aucune position ouverte.
              </td>
            </tr>
          )}
          {assetKeys.map((asset) => {
            const s = summary[asset];
            return (
              <tr key={asset} className="border-b last:border-b-0">
                <td className="font-medium">{asset}</td>
                <td>{s.quantity.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}</td>
                <td>{s.costAvg.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                <td>{s.currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                <td>{s.invested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>{s.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={s.realised >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {s.realised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={s.unrealised >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {s.unrealised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={s.pnlPercent >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {s.pnlPercent !== null ? s.pnlPercent.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%' : '—'}
                </td>
              </tr>
            );
          })}
          {assetKeys.length > 0 && (
            <tr className="font-semibold bg-gray-50">
              <td>Total</td>
              <td></td>
              <td></td>
              <td></td>
              <td>{totals.invested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{totals.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className={totals.realised >= 0 ? 'text-green-700' : 'text-red-700'}>
                {totals.realised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={totals.unrealised >= 0 ? 'text-green-700' : 'text-red-700'}>
                {totals.unrealised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={totals.pnl >= 0 ? 'text-green-700' : 'text-red-700'}>
                {totals.invested > 0
                  ? ((totals.pnl / totals.invested) * 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
                  : '—'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}