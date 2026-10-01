const labels = {
  available: 'Available', checked_out: 'Checked out', broken: 'Broken', in_use: 'In use', maintenance: 'Maintenance',
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected', active: 'Active', returned: 'Returned', overdue: 'Overdue',
}

export default function StatusBadge({ status }) {
  return <span className={`status status-${status}`}>{labels[status] || status}</span>
}
