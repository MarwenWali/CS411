import { useEffect, useState } from 'react'
import { getBookings, returnBooking, cancelBooking } from '../api/bookings'
import DataTable from '../components/DataTable'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { PageIntro } from './Dashboard'

export default function MyBookings() {
  const [rows, setRows] = useState(null); const [error, setError] = useState('')
  const load = () => getBookings().then(setRows).catch((e) => setError(e.message))
  useEffect(load, [])
  async function cancel(row) { try { await (row.status === 'pending' ? cancelBooking(row.id) : returnBooking(row.id)); load() } catch (e) { setError(e.message) } }
  if (!rows) return <PageIntro eyebrow="RESERVATIONS" title="My bookings"><LoadingState /></PageIntro>
  return <PageIntro eyebrow="RESERVATIONS" title="My bookings" subtitle="Track every request and return active resources when you are finished.">{error && <div className="alert error">{error}</div>}<DataTable rows={rows} empty="No bookings yet." columns={[{ key: 'target', label: 'Resource', render: (r) => `${r.target_type} #${r.target_id}` }, { key: 'start_time', label: 'Starts', render: (r) => new Date(r.start_time).toLocaleString() }, { key: 'end_time', label: 'Ends', render: (r) => new Date(r.end_time).toLocaleString() }, { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'action', label: '', render: (r) => r.status === 'pending' ? <button className="table-action danger" onClick={() => cancel(r)}>Cancel</button> : r.status === 'active' ? <button className="table-action" onClick={() => cancel(r)}>Return</button> : null }]} /></PageIntro>
}
