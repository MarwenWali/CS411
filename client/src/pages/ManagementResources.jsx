import { useEffect, useState } from 'react'
import { getComponents, createComponent, updateComponent, deleteComponent } from '../api/components'
import { getMachines, createMachine, updateMachine, deleteMachine } from '../api/machines'
import DataTable from '../components/DataTable'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { PageIntro } from './Dashboard'

const defaults = { components: { name: '', quantity: 1, status: 'available' }, machines: { name: '', status: 'available', requires_instructor: false } }
export default function ManagementResources({ type }) {
  const isMachine = type === 'machines'; const api = isMachine ? { get: getMachines, create: createMachine, update: updateMachine, remove: deleteMachine } : { get: getComponents, create: createComponent, update: updateComponent, remove: deleteComponent }
  const [rows, setRows] = useState(null); const [form, setForm] = useState(defaults[type]); const [editing, setEditing] = useState(null); const [error, setError] = useState('')
  const load = () => api.get().then(setRows).catch((e) => setError(e.message)); useEffect(load, [])
  const save = async (e) => { e.preventDefault(); try { editing ? await api.update(editing, form) : await api.create(form); setEditing(null); setForm(defaults[type]); load() } catch (err) { setError(err.message) } }
  const edit = (row) => { setEditing(row.id); setForm({ ...row, requires_instructor: Boolean(row.requires_instructor) }) }
  const remove = async (id) => { if (window.confirm('Delete this resource?')) { try { await api.remove(id); load() } catch (e) { setError(e.message) } } }
  const toggle = async (row) => { try { await api.update(row.id, { ...row, status: row.status === 'broken' ? 'available' : 'broken' }); load() } catch (e) { setError(e.message) } }
  if (!rows) return <PageIntro eyebrow="OPERATIONS" title={isMachine ? 'Machines' : 'Components'}><LoadingState /></PageIntro>
  return <PageIntro eyebrow="OPERATIONS" title={isMachine ? 'Machines' : 'Components'} subtitle="Keep the workshop inventory accurate and bookable.">{error && <div className="alert error">{error}</div>}<form className="panel inline-form" onSubmit={save}><input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{!isMachine && <input required type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />}{isMachine && <label className="check"><input type="checkbox" checked={form.requires_instructor} onChange={(e) => setForm({ ...form, requires_instructor: e.target.checked })} /> Instructor required</label>}<button className="primary-button">{editing ? 'Save changes' : 'Add resource'}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(defaults[type]) }}>Cancel</button>}</form><DataTable rows={rows} empty={`No ${type} created yet.`} columns={[{ key: 'name', label: 'Name' }, ...(!isMachine ? [{ key: 'quantity', label: 'Quantity' }] : [{ key: 'requires_instructor', label: 'Supervision', render: (r) => r.requires_instructor ? 'Required' : 'Not required' }]), { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }, { key: 'actions', label: '', render: (r) => <span className="actions"><button className="table-action" onClick={() => edit(r)}>Edit</button><button className="table-action" onClick={() => toggle(r)}>{r.status === 'broken' ? 'Available' : 'Broken'}</button><button className="table-action danger" onClick={() => remove(r.id)}>Delete</button></span> }]} /></PageIntro>
}
