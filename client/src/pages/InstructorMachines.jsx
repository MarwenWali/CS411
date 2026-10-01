import { useEffect, useState } from 'react'
import { getMachines } from '../api/machines'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { PageIntro } from './Dashboard'

export default function InstructorMachines() { const [rows, setRows] = useState(null); const [error, setError] = useState(''); useEffect(() => { getMachines().then(setRows).catch((e) => setError(e.message)) }, []); if (!rows) return <PageIntro eyebrow="WORKSHOP FLOOR" title="Machines"><LoadingState /></PageIntro>; return <PageIntro eyebrow="WORKSHOP FLOOR" title="Machines" subtitle="Read the current state before supervising a session.">{error && <div className="alert error">{error}</div>}<div className="resource-grid">{rows.map((r) => <article className="resource-card" key={r.id}><div className="resource-top"><span className="resource-kind">Machine</span><StatusBadge status={r.status} /></div><h4>{r.name}</h4><p>{r.requires_instructor ? 'Instructor supervision required' : 'Open workshop machine'}</p></article>)}</div></PageIntro> }
