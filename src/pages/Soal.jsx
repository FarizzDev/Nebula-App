import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMateriList } from '../lib/store'

export default function Soal() {
  const [materi, setMateri]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMateriList().then(l => { setMateri(l); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--color-surface-3)', borderTopColor:'var(--color-neon)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding:'20px 16px', maxWidth:600, margin:'0 auto' }}>
      <h1 style={{ fontSize:22, fontWeight:800, color:'var(--color-text)', marginBottom:4 }}>Latihan Soal</h1>
      <p style={{ fontSize:13, color:'#8090a8', marginBottom:20 }}>Pilih materi untuk mulai</p>
      {materi.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <p style={{ fontSize:40, marginBottom:8 }}>📝</p>
          <p style={{ color:'var(--color-text-2)', fontWeight:500, marginBottom:4 }}>Belum ada materi</p>
          <p style={{ fontSize:13, color:'#8090a8', marginBottom:16 }}>Tambah materi dulu ya</p>
          <Link to="/materi"><button className="btn-primary" style={{ padding:'10px 20px', borderRadius:10, fontSize:14, fontWeight:600 }}>+ Tambah Materi</button></Link>
        </div>
      ) : materi.map(m => (
        <Link key={m.id} to={`/materi/${m.id}`} style={{ textDecoration:'none', display:'block', marginBottom:8 }}>
          <div className="glass glass-hover" style={{ borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22, flexShrink:0 }}>📝</span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.judul}</p>
              <p style={{ fontSize:12, color:'#8090a8', marginTop:2 }}>Tap untuk generate soal</p>
            </div>
            <span style={{ color:'var(--color-text-3)', fontSize:18 }}>›</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
