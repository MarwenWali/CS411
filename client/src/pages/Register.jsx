import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { AuthScreen } from './Login'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const { persistSession } = useAuth(); const navigate = useNavigate()
  const submit = async (event) => { event.preventDefault(); setError(''); try { persistSession(await register(form)); navigate('/dashboard', { replace: true }) } catch (err) { setError(err.message) } }
  return <AuthScreen title="Join the workshop" subtitle="Create your access pass in under a minute."><form onSubmit={submit} className="auth-form"><Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Your name" /><Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="you@fablab.org" /><Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} placeholder="At least 8 characters" /><label className="field"><span>Workspace role</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="instructor">Instructor</option><option value="management">Management</option></select></label>{error && <div className="alert error">{error}</div>}<button className="primary-button wide">Create access <span>→</span></button></form><p className="auth-switch">Already have access? <Link to="/login">Sign in</Link></p></AuthScreen>
}
function Field({ label, type = 'text', value, onChange, placeholder }) { return <label className="field"><span>{label}</span><input required type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label> }
