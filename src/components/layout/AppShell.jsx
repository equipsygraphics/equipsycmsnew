import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer, useToast } from '../ui/Toast'
import { AttributesProvider } from '../../context/AttributesContext'
import { ProductCostProvider } from '../../context/ProductCostContext'
import { CostVariablesProvider } from '../../context/CostVariablesContext'
import { PricingSettingsProvider } from '../../context/PricingSettingsContext'
import { CompetitorPricingConfigProvider } from '../../context/CompetitorPricingConfigContext'
import { DiscountSettingsProvider } from '../../context/DiscountSettingsContext'
import { TradeVolumePricingProvider } from '../../context/TradeVolumePricingContext'

// Every page in the app sits under all of these — combined here so adding a
// new shared context doesn't mean another level of visual nesting below.
const PROVIDERS = [
  AttributesProvider,
  ProductCostProvider,
  CostVariablesProvider,
  PricingSettingsProvider,
  CompetitorPricingConfigProvider,
  DiscountSettingsProvider,
  TradeVolumePricingProvider,
]

function ComposedProviders({ children }) {
  return PROVIDERS.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}

export function AppShell() {
  const { toasts, dismiss } = useToast()

  return (
    <ComposedProviders>
      <div className="flex h-screen w-screen overflow-hidden bg-bg">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="w-full min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ComposedProviders>
  )
}
