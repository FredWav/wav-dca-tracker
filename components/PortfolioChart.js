import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Renders a combined line and bar chart of the portfolio's monthly evolution.
 *
 * The line represents the portfolio's total value (holdings + realised), while
 * the bar represents total invested capital up to that month. A tooltip
 * displays the breakdown when hovering.
 *
 * @param {{ history: Array }} props
 */
export default function PortfolioChart({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-gray-500">Aucune donnée pour le graphique.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={history} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" orientation="left" tickFormatter={(v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} />
        <Tooltip formatter={(value) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
        <Legend />
        {/* Bar for invested capital */}
        <Bar
          yAxisId="right"
          dataKey="invested"
          name="Investi (€)"
          fill="#0e7490"
          barSize={20}
        />
        {/* Line for portfolio value */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={(d) => d.value + d.realised}
          name="Valeur totale (€)"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}