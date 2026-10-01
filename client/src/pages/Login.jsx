import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { persistSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try { const session = await login(form); persistSession(session); navigate(location.state?.from?.pathname || '/dashboard', { replace: true }) } catch (err) { setError(err.message) }
  }
  return <AuthScreen title="Welcome back" subtitle="Sign in to your workshop command center.">
    <form onSubmit={submit} className="auth-form"><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="you@fablab.org" /><Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} placeholder="••••••••" />{error && <div className="alert error">{error}</div>}<button className="primary-button wide">Enter Forge <span>→</span></button></form>
    <p className="auth-switch">New to the lab? <Link to="/register">Create an account</Link></p>
  </AuthScreen>
}

export function AuthScreen({ title, subtitle, children }) { return <div className="auth-page"><div className="auth-aside"><div className="brand light"><span className="brand-mark">F</span><div><strong>Forge</strong><small>FABLAB OPERATIONS</small></div></div><div className="aside-copy"><span className="eyebrow">MAKE / MANAGE / MOVE</span><h1>Tools for the people who make things.</h1><p>A calm command layer for shared machines, components, and the brilliant work that happens around them.</p></div><div className="aside-foot">EST. 2024 <span>•</span> OPEN WORKSHOP SYSTEM</div></div><div className="auth-panel"><div className="auth-card"><span className="eyebrow">SECURE ACCESS</span><h2>{title}</h2><p>{subtitle}</p>{children}</div></div></div> }
function Field({ label, type = 'text', value, onChange, placeholder }) { return <label className="field"><span>{label}</span><input required type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label> }
