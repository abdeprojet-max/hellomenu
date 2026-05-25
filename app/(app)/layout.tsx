import { AppSidebar } from '@/components/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <div className="hm-app-content">
        <div className="hm-app-main">
          {children}
        </div>
      </div>
    </div>
  )
}
