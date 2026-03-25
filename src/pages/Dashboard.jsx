import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMateriList, getReminders, getSettings } from '../lib/store'

export default function Dashboard() {
  const [materi, setMateri]     = useState([])
  const [reminders, setReminders] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const [m, r, s] = await Promise.all([getMateriList(), getReminders(), getSettings()])
      setMateri(m.slice(0, 3))
      setReminders(r.filter(x => !x.done).slice(0, 4))
      setSettings(s)
      setLoading(false)
    }
    load()
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'
  const now      = new Date()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--color-surface-3)', borderTopColor:'var(--color-neon)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding:'20px 16px', maxWidth:600, margin:'0 auto' }} className="stagger">
      <div style={{ marginBottom:22 }}>
        <p style={{ fontSize:13, color:'#94a3b8', fontFamily:'var(--font-mono)', marginBottom:4 }}>{greeting} ✦</p>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--color-text)', lineHeight:1.2 }}>
          Ayo belajar hari ini <span className="glow-text" style={{ color:'var(--color-neon-2)' }}>🚀</span>
        </h1>
      </div>

      {!settings.apiKey && (
        <Link to="/settings" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
          <div className="glass" style={{ borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', gap:11, borderColor:'rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.05)' }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--color-warning)' }}>API Key belum diset</p>
              <p style={{ fontSize:12, color:'#8090a8', marginTop:2 }}>Tap untuk ke Pengaturan</p>
            </div>
            <span style={{ color:'var(--color-text-3)', fontSize:18 }}>›</span>
          </div>
        </Link>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { to:'/materi',   icon:'📚', label:'Materi',   desc:'Tambah & kelola' },
          { to:'/soal',     icon:'📝', label:'Latihan',  desc:'Kerjain soal' },
          { to:'/chat',     icon:'🤖', label:'Chat AI',  desc:'Tanya bebas' },
          { to:'/reminder', icon:'⏰', label:'Reminder', desc:'PR & deadline' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
            <div className="glass glass-hover" style={{ borderRadius:14, padding:'14px 12px', cursor:'pointer', height:'100%', transition:'all 0.2s' }}>
              <span style={{ fontSize:26, display:'block', marginBottom:8 }}>{item.icon}</span>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--color-text)' }}>{item.label}</p>
              <p style={{ fontSize:12, color:'#8090a8', marginTop:2 }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass" style={{ borderRadius:14, padding:16, marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'var(--color-text)' }}>Materi Terbaru</h2>
          <Link to="/materi" style={{ fontSize:12, color:'var(--color-neon-2)', textDecoration:'none' }}>Lihat semua →</Link>
        </div>
        {materi.length === 0 ? (
          <div style={{ textAlign:'center', padding:'14px 0' }}>
            <p style={{ fontSize:28, marginBottom:6 }}>📭</p>
            <p style={{ fontSize:13, color:'#8090a8' }}>Belum ada materi</p>
            <Link to="/materi" style={{ fontSize:12, color:'var(--color-neon-2)' }}>Tambah sekarang →</Link>
          </div>
        ) : materi.map(m => (
          <Link key={m.id} to={`/materi/${m.id}`} style={{ textDecoration:'none', display:'block' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--color-border)' }}>
              <span style={{ fontSize:18 }}>📖</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.judul}</p>
                <p style={{ fontSize:11, color:'#8090a8' }}>{new Date(m.updatedAt).toLocaleDateString('id-ID')}</p>
              </div>
              <span style={{ color:'var(--color-text-3)', fontSize:16 }}>›</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass" style={{ borderRadius:14, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'var(--color-text)' }}>PR & Deadline</h2>
          <Link to="/reminder" style={{ fontSize:12, color:'var(--color-neon-2)', textDecoration:'none' }}>Kelola →</Link>
        </div>
        {reminders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'14px 0' }}>
            <p style={{ fontSize:28, marginBottom:6 }}>✅</p>
            <p style={{ fontSize:13, color:'#8090a8' }}>Semua tugas beres!</p>
          </div>
        ) : reminders.map(r => {
          const dl      = r.deadline ? new Date(r.deadline) : null
          const overdue = dl && dl < now
          const today   = dl && dl.toDateString() === now.toDateString()
          return (
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--color-border)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:overdue?'var(--color-danger)':today?'var(--color-warning)':'var(--color-neon)', boxShadow:`0 0 6px ${overdue?'rgba(248,113,113,0.6)':today?'rgba(251,191,36,0.6)':'rgba(59,130,246,0.6)'}` }} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:500, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.judul}</p>
                {dl && <p style={{ fontSize:11, color:overdue?'var(--color-danger)':today?'var(--color-warning)':'#8090a8' }}>{overdue?'⚠️ Terlambat':today?'⏰ Hari ini':dl.toLocaleDateString('id-ID')}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
