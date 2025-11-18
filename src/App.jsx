import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Notes from '@/pages/Notes'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster
        toastOptions={{
          className: 'border border-border shadow-md',
          duration: 2000,
          success: { className: 'bg-status-online-bg text-status-online-text' },
          error: { className: 'bg-status-denied-bg text-status-denied-text' },
        }}
      />
    </QueryClientProvider>
  )
}