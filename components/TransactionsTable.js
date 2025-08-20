/**
 * Renders a tabular view of individual transactions. Each row displays
 * the transaction details and includes a delete button to remove
 * transactions. Styling is kept consistent with the rest of the app.
 *
 * @param {{ transactions: Array, onDelete: Function }} props
 */
export default function TransactionsTable({ transactions, onDelete }) {
  return (
    <div className="overflow-auto border rounded-lg">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Plateforme</th>
            <th>Type</th>
            <th>Actif</th>
            <th>Prix (€)</th>
            <th>Quantité</th>
            <th>Total (€)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-4 text-gray-500">
                Aucune transaction pour le moment.
              </td>
            </tr>
          )}
          {transactions.map((tx, idx) => {
            const total = (tx.price * tx.quantity).toFixed(2);
            return (
              <tr key={idx} className="border-b last:border-b-0">
                <td>{tx.date}</td>
                <td>{tx.platform}</td>
                <td>{tx.type === 'BUY' ? 'Achat' : 'Vente'}</td>
                <td>{tx.asset}</td>
                <td>{tx.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                <td>{tx.quantity.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}</td>
                <td>{total}</td>
                <td>
                  <button
                    onClick={() => onDelete(idx)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer cette transaction"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}