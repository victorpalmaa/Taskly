import { Rocket } from 'lucide-react'
import { useDbHealth } from '@/api/tasksApi'

export default function Header() {
  const { data } = useDbHealth()
  const status = data?.status
  const message = data?.message
  const bannerClass =
    status === 'ok'
      ? 'bg-status-online-bg text-status-online-text shadow-md'
      : status === 'missing_table'
      ? 'bg-status-missing-bg text-status-missing-text shadow-md'
      : status === 'permission_denied'
      ? 'bg-status-denied-bg text-status-denied-text shadow-md'
      : status === 'disabled'
      ? 'bg-bg-surface text-text-secondary'
      : 'bg-status-denied-bg text-status-denied-text shadow-md'
  return (
    <header className="px-6 pt-8">
      <div className="flex items-center justify-center gap-4">
        <div className="p-4 rounded-xl text-white shadow-md bg-brand-gradient">
          <Rocket size={36} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-brand-gradient">
          Taskly
        </h1>
      </div>
      {status && status !== 'ok' && (
        <div className={`mt-4 mx-auto max-w-xl text-center rounded-full px-3 py-1 text-sm font-medium ${bannerClass}`}>
          {message}
        </div>
      )}
    </header>
  )
}