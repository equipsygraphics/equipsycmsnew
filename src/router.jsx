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
import { TagDetail } from './pages/tags/TagDetail'
import { QuoteRequests } from './pages/requests/QuoteRequests'
import { QuoteDetail } from './pages/requests/QuoteDetail'
import { FeedbackList } from './pages/feedback/FeedbackList'
import { FeedbackDetail } from './pages/feedback/FeedbackDetail'
import { OTFeedbackList } from './pages/feedback/OTFeedbackList'
import { OTFeedbackDetail } from './pages/feedback/OTFeedbackDetail'
import { FormsList } from './pages/forms/FormsList'
import { FormDetail } from './pages/forms/FormDetail'
import { EnquiryList } from './pages/enquiries/EnquiryList'
import { EnquiryDetail } from './pages/enquiries/EnquiryDetail'
import { Subscribers } from './pages/subscribers/Subscribers'
import { TradeAccount } from './pages/requests/TradeAccount'
import { TradeAccountDetail } from './pages/requests/TradeAccountDetail'
import { BuilderPack } from './pages/requests/BuilderPack'
import { BuilderPackDetail } from './pages/requests/BuilderPackDetail'
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
      { path: '/products/:id', element: <ProductForm /> },
      { path: '/attributes', element: <Attributes /> },
      { path: '/mega-menu', element: <MegaMenu /> },
      { path: '/orders', element: <OrdersList /> },
      { path: '/orders/:id', element: <OrderDetail /> },
      { path: '/customers', element: <CustomersList /> },
      { path: '/customers/:id', element: <CustomerDetail /> },
      { path: '/feedback', element: <FeedbackList /> },
      { path: '/feedback/:id', element: <FeedbackDetail /> },
      { path: '/ot-feedback', element: <OTFeedbackList /> },
      { path: '/ot-feedback/:id', element: <OTFeedbackDetail /> },

      // Content
      { path: '/pages', element: <Pages /> },
      { path: '/pages/:id', element: <PageDetail /> },
      { path: '/tags', element: <Tags /> },
      { path: '/tags/:id', element: <TagDetail /> },
      { path: '/blog', element: <BlogList /> },
      { path: '/blog/:id', element: <BlogForm /> },
      { path: '/media', element: <MediaLibrary /> },

      // Forms
      { path: '/forms', element: <FormsList /> },
      { path: '/forms/:id', element: <FormDetail /> },

      // Enquiries
      { path: '/enquiries', element: <EnquiryList /> },
      { path: '/enquiries/:id', element: <EnquiryDetail /> },

      // Subscribers
      { path: '/subscribers', element: <Subscribers /> },

      // Requests
      { path: '/quote-requests', element: <QuoteRequests /> },
      { path: '/quote-requests/:id', element: <QuoteDetail /> },
      { path: '/trade-account', element: <TradeAccount /> },
      { path: '/trade-account/:id', element: <TradeAccountDetail /> },
      { path: '/builder-pack', element: <BuilderPack /> },
      { path: '/builder-pack/:id', element: <BuilderPackDetail /> },

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
