import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingBottom: '72px',
    }}>
      {children}
      <BottomNav />
    </div>
  )
}
