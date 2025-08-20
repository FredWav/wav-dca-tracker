import { useState } from 'react';

/**
 * TransactionForm provides a controlled form for entering new buy/sell
 * transactions. It calls `onAdd` with a standardised transaction
 * object when submitted. The parent component is responsible for
 * persisting the transaction and updating any derived state (prices,
 * summaries, history, etc.).
 *
 * @param {{ onAdd: Function }} props
 */
export default function TransactionForm({ onAdd }) {
  // Initialise with today's date in ISO format
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [platform, setPlatform] = useState('Crypto.com');
  const [asset, setAsset] = useState('BTC');
  const [type, setType] = useState('BUY');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const pr = parseFloat(price);
    if (!date || !asset || isNaN(pr) || isNaN(qty)) {
      return;
    }
    onAdd({
      date,
      platform,
      asset: asset.toUpperCase(),
      type,
      price: pr,
      quantity: qty,
    });
    // Reset quantity and price, but keep date/platform/asset for convenience
    setPrice('');
    setQuantity('');
  };

  const totalValue = (() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);
    return !isNaN(p) && !isNaN(q) ? (p * q).toFixed(2) : '';
  })();

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Nouvelle transaction</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Plateforme</label>
          <select
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="Crypto.com">Crypto.com</option>
            <option value="Bitget">Bitget</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="BUY">Achat</option>
            <option value="SELL">Vente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Actif</label>
          <input
            type="text"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md uppercase"
            value={asset}
            onChange={(e) => setAsset(e.target.value.toUpperCase())}
            placeholder="BTC, ETH, SOL ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix unitaire (€)</label>
          <input
            type="number"
            step="0.0001"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantité</label>
          <input
            type="number"
            step="0.00000001"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total (€)</label>
          <input
            type="text"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            value={totalValue}
            readOnly
          />
        </div>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
}