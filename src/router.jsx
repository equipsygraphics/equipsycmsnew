import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Placeholder } from './pages/Placeholder'
import { ProductsList } from './pages/products/ProductsList'
import { ProductForm } from './pages/products/ProductForm'
import { OrdersList } from './pages/orders/OrdersList'
import { OrderDetail } from './pages/orders/OrderDetail'
import { CustomersList } from './pages/customers/CustomersList'
import { CustomerDetail } from './pages/customers/CustomerDetail'
import { MegaMenu } from './pages/mega-menu/MegaMenu'
import { Attributes } from './pages/attributes/Attributes'
import { BlogList } from './pages/blog/BlogList'
import { BlogForm } from './pages/blog/BlogForm'
import { MediaLibrary } from './pages/media/MediaLibrary'
import { Pages } from './pages/pages/Pages'
import { PageDetail } from './pages/pages/PageDetail'
import { Tags } from './pages/tags/Tags'
import { QuoteRequests } from './pages/requests/QuoteRequests'
import { QuoteDetail } from './pages/requests/QuoteDetail'
import { TradeAccount } from './pages/requests/TradeAccount'
import { BuilderPack } from './pages/requests/BuilderPack'
import { Campaigns } from './pages/marketing/Campaigns'
import { Coupons } from './pages/marketing/Coupons'
import { Emails } from './pages/marketing/Emails'
import { Newsletter } from './pages/marketing/Newsletter'
import { SalesAnalytics } from './pages/analytics/SalesAnalytics'
import { WebPerformance } from './pages/analytics/WebPerformance'
import { SEO } from './pages/analytics/SEO'
import { Settings } from './pages/settings/Settings'
import { Accounts } from './pages/settings/Accounts'
import { AdminSettings } from './pages/settings/AdminSettings'

const ph = (title) => ({ element: <Placeholder title={title} /> })

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Dashboard /> },

      // Commerce
      { path: '/products', element: <ProductsList /> },
      { path: '/products/new', element: <ProductForm /> },
      { path: '/products/:id', element: <ProductForm /> },
      { path: '/attributes', element: <Attributes /> },
      { path: '/mega-menu', element: <MegaMenu /> },
      { path: '/orders', element: <OrdersList /> },
      { path: '/orders/:id', element: <OrderDetail /> },
      { path: '/customers', element: <CustomersList /> },
      { path: '/customers/:id', element: <CustomerDetail /> },

      // Content
      { path: '/pages', element: <Pages /> },
      { path: '/pages/:id', element: <PageDetail /> },
      { path: '/tags', element: <Tags /> },
      { path: '/blog', element: <BlogList /> },
      { path: '/blog/new', element: <BlogForm /> },
      { path: '/blog/:id', element: <BlogForm /> },
      { path: '/media', element: <MediaLibrary /> },

      // Requests
      { path: '/quote-requests', element: <QuoteRequests /> },
      { path: '/quote-requests/:id', element: <QuoteDetail /> },
      { path: '/trade-account', element: <TradeAccount /> },
      { path: '/builder-pack', element: <BuilderPack /> },

      // Marketing
      { path: '/campaigns', element: <Campaigns /> },
      { path: '/coupons', element: <Coupons /> },
      { path: '/emails', element: <Emails /> },
      { path: '/newsletter', element: <Newsletter /> },

      // Analytics
      { path: '/analytics/sales', element: <SalesAnalytics /> },
      { path: '/analytics/performance', element: <WebPerformance /> },
      { path: '/analytics/seo', element: <SEO /> },

      // Settings
      { path: '/settings', element: <Settings /> },
      { path: '/accounts', element: <Accounts /> },
      { path: '/admin-settings', element: <AdminSettings /> },
    ],
  },
])
