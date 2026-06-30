import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer, useToast } from '../ui/Toast'

export function AppShell() {
  const { toasts, dismiss } = useToast()

  return (
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
  )
}
