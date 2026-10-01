import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = {
  student: [{ to: '/dashboard', label: 'Overview' }, { to: '/book', label: 'New booking' }, { to: '/bookings', label: 'My bookings' }],
  management: [{ to: '/dashboard', label: 'Overview' }, { to: '/management/components', label: 'Components' }, { to: '/management/machines', label: 'Machines' }, { to: '/management/bookings', label: 'All bookings' }],
  instructor: [{ to: '/dashboard', label: 'Overview' }, { to: '/instructor/machines', label: 'Machines' }, { to: '/instructor/availability', label: 'Availability' }, { to: '/instructor/bookings', label: 'Pending approvals' }],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">F</span><div><strong>Forge</strong><small>FABLAB OPERATIONS</small></div></div>
      <div className="workspace-label">Workspace</div>
      <nav>{links[user.role].map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><span className="nav-dot" />{link.label}</NavLink>)}</nav>
      <div className="sidebar-foot"><div className="status-light" />Network connected</div>
    </aside>
    <main className="main-shell">
      <header className="topbar"><div className="crumb">FABLAB / <strong>{user.role}</strong></div><div className="profile"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><button className="icon-button" onClick={() => { logout(); navigate('/login') }} title="Log out">↗</button></div></header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>
}
