import { useEffect, useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionsTable from '../components/TransactionsTable';
import SummaryTable from '../components/SummaryTable';
import PortfolioChart from '../components/PortfolioChart';
import { fetchPrices } from '../utils/prices';
import { computePnL, computeMonthlyHistory } from '../utils/finance';

/**
 * The main application page. It ties together the form, tables, charts
 * and state management. User transactions are persisted to
 * localStorage under the key `wavDcaTransactions`. Prices are fetched
 * from CoinGecko, with manual overrides for presale tokens.
 */
export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [manualPrices, setManualPrices] = useState({ RTX: 0.0042, LBRETT: 0.0042 });
  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wavDcaTransactions');
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des transactions :', err);
    }
  }, []);

  // Persist transactions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('wavDcaTransactions', JSON.stringify(transactions));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des transactions :', err);
    }
  }, [transactions]);

  // Fetch prices whenever the set of assets or manual prices changes
  useEffect(() => {
    const assets = Array.from(new Set(transactions.map((tx) => tx.asset)));
    if (assets.length === 0) {
      setPrices({});
      return;
    }
    let cancelled = false;
    (async () => {
      const pr = await fetchPrices(assets, manualPrices);
      if (!cancelled) {
        setPrices(pr);
        setLastUpdated(new Date().toISOString());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [transactions, manualPrices]);

  // Recompute summary whenever transactions or prices change
  useEffect(() => {
    const s = computePnL(transactions, prices);
    setSummary(s);
    const hist = computeMonthlyHistory(transactions, prices);
    setHistory(hist);
  }, [transactions, prices]);

  // Add a transaction to state
  const handleAddTransaction = (tx) => {
    setTransactions((prev) => [...prev, tx]);
  };

  // Delete a transaction by index
  const handleDeleteTransaction = (index) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  // Export transactions as a JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wav-dca-transactions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import transactions from a JSON file
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          setTransactions(imported);
        } else {
          alert('Fichier invalide');
        }
      } catch (err) {
        alert('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  // Clear all transactions and data
  const handleClear = () => {
    if (window.confirm('Supprimer toutes les transactions ?')) {
      setTransactions([]);
      setPrices({});
      setHistory([]);
      setSummary({});
      localStorage.removeItem('wavDcaTransactions');
    }
  };

  // Manual price override inputs for tokens not available via API
  const renderManualPriceInputs = () => {
    return Object.keys(manualPrices).map((asset) => (
      <div key={asset} className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700" htmlFor={`price-${asset}`}>
          Prix {asset} (€)
        </label>
        <input
          id={`price-${asset}`}
          type="number"
          step="0.0001"
          className="p-2 border border-gray-300 rounded-md w-24"
          value={manualPrices[asset]}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setManualPrices((prev) => ({ ...prev, [asset]: isNaN(value) ? 0 : value }));
          }}
        />
      </div>
    ));
  };

  // Exit rule suggestions for speculative positions
  const renderExitSuggestions = () => {
    const suggestions = [];
    for (const asset of ['RTX', 'LBRETT']) {
      const s = summary[asset];
      if (!s || !s.quantity) continue;
      const threshold = s.costAvg * 2;
      const current = prices[asset] ?? manualPrices[asset];
      if (current >= threshold && s.quantity > 0) {
        suggestions.push(
          `Le prix de ${asset} a doublé depuis votre coût moyen (≥ ${threshold.toFixed(4)} €).\nPensez à vendre une partie de votre position pour sécuriser vos gains.`
        );
      }
    }
    return suggestions.length > 0 ? (
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded">
        {suggestions.map((msg, idx) => (
          <p key={idx} className="mb-2 last:mb-0 whitespace-pre-line">
            {msg}
          </p>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header with logo and last update */}
      <header className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Wav DCA Tracker" className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Wav DCA Tracker</h1>
            <p className="text-sm text-gray-500">Suivi de vos investissements mensuels</p>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-xs text-gray-500">Dernière mise à jour des prix : {new Date(lastUpdated).toLocaleString('fr-FR')}</div>
        )}
      </header>

      {/* Transaction form */}
      <TransactionForm onAdd={handleAddTransaction} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Exporter JSON
        </button>
        <label className="inline-block bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700">
          Importer JSON
          <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </label>
        <button
          onClick={() => {
            // Trigger price refresh by updating manualPrices (forces useEffect)
            setManualPrices((prev) => ({ ...prev }));
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Rafraîchir les prix
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Tout effacer
        </button>
      </div>

      {/* Manual price overrides */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded shadow">
        {renderManualPriceInputs()}
      </div>

      {/* Exit rule suggestions */}
      {renderExitSuggestions()}

      {/* Summary table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Résumé des positions</h2>
        <SummaryTable summary={summary} />
      </div>

      {/* Portfolio history chart */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Évolution mensuelle</h2>
        <PortfolioChart history={history} />
        {history && history.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            * Le graphique utilise les prix actuels pour estimer la valeur de chaque mois.
          </div>
        )}
      </div>

      {/* Monthly return table */}
      {history && history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Performance mensuelle</h2>
          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Investi (€)</th>
                  <th>Valeur (€)</th>
                  <th>Réal. (€)</th>
                  <th>Non‑réal. (€)</th>
                  <th>PnL (€)</th>
                  <th>Retour (%)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td>{h.month}</td>
                    <td>{h.invested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{h.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{h.realised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{h.unrealised.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{h.pnl.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={h.return >= 0 ? 'text-green-700' : 'text-red-700'}>
                      {h.return.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        <TransactionsTable transactions={transactions} onDelete={handleDeleteTransaction} />
      </div>
    </div>
  );
}