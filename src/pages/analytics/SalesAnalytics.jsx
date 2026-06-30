import { useState } from 'react'
import { TrendingUp, ShoppingBag, DollarSign, Users, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { toast } from '../../components/ui/Toast'
import { revenueByMonth, bestSellingProducts, salesByCategory } from '../../data/mockAnalytics'

const DATE_RANGES = ['Last 30 days', 'Last 3 months', 'Last 6 months', 'This year']

function KpiCard({ label, value, change, icon: Icon, color }) {
  const positive = change >= 0
  return (
    <div className="bg-surface rounded-xl border border-border shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-success-500' : 'text-error-500'}`}>
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{positive ? '+' : ''}{change}% vs last month</span>
      </div>
    </div>
  )
}

const fmt = (v) => `$${(v / 1000).toFixed(0)}k`

export function SalesAnalytics() {
  const [dateRange, setDateRange] = useState('Last 6 months')

  const totalRevenue = revenueByMonth.reduce((a, m) => a + m.revenue, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sales Analytics"
        subtitle="Revenue, orders, and product performance."
        actions={
          <div className="flex gap-2">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm outline-none focus:border-brand-500">
              {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => toast('Sales report exported', 'success')}>Export Report</Button>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Revenue (MTD)" value="$79,200" change={14} icon={DollarSign} color="bg-brand-50 text-brand-500" />
        <KpiCard label="Orders (MTD)" value="184" change={9} icon={ShoppingBag} color="bg-success-500/10 text-success-500" />
        <KpiCard label="Avg Order Value" value="$312" change={8} icon={TrendingUp} color="bg-warning-500/10 text-warning-500" />
        <KpiCard label="New Customers" value="47" change={23} icon={Users} color="bg-brand-50 text-brand-400" />
      </div>

      {/* Revenue bar chart */}
      <div className="bg-surface rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-text-primary">Revenue â€” Last 6 Months</p>
          <p className="text-sm text-text-muted">Total <span className="font-semibold text-text-primary">${totalRevenue.toLocaleString()}</span></p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueByMonth} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tickFormatter={fmt} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={40} />
            <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} label={{ position: 'top', formatter: fmt, fontSize: 11, fill: '#6B7280' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Best Selling Products */}
        <div className="col-span-2 bg-surface rounded-xl border border-border shadow-card overflow-x-auto">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">Best Selling Products</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-50">
                {['Product', 'Units Sold', 'Revenue', 'Category'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bestSellingProducts.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-grey-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-text-primary">{p.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{p.units}</td>
                  <td className="px-5 py-3 font-medium text-text-primary">${p.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-text-muted">{p.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category breakdown */}
        <div className="bg-surface rounded-xl border border-border shadow-card p-5">
          <p className="text-sm font-semibold text-text-primary mb-4">Sales by Category</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {salesByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {salesByCategory.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-text-secondary">{cat.name}</span>
                </div>
                <span className="font-medium text-text-primary">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
