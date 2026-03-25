import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getMateriList, saveMateri, deleteMateri } from '../lib/store'
import { fetchMateriFromTopic } from '../lib/gemini'
import { hapticSuccess } from '../lib/notifications'

function EditModal({ materi, onSave, onClose }) {
  const [form, setForm] = useState({ judul:materi?.judul||'', konten:materi?.konten||'', tags:materi?.tags||'' })
  const inputS = { width:'100%', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10, padding:'11px 13px', fontSize:14, color:'var(--color-text)', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }} onClick={onClose} />
      <div className="glass animate-fade-up" style={{ position:'relative', width:'100%', maxWidth:520, borderRadius:20, border:'1px solid var(--color-border-2)', maxHeight:'88vh', overflowY:'auto' }}>
        <div style={{ padding:'15px 16px 12px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text)' }}>{materi?'Edit Materi':'Tambah Materi'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', fontSize:20 }}>×</button>
        </div>
        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
          <div>
            <p style={{ fontSize:12, color:'#8090a8', marginBottom:5 }}>Judul</p>
            <input value={form.judul} onChange={e=>setForm(f=>({...f,judul:e.target.value}))} style={inputS} onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
          </div>
          <div>
            <p style={{ fontSize:12, color:'#8090a8', marginBottom:5 }}>Konten (Markdown)</p>
            <textarea value={form.konten} onChange={e=>setForm(f=>({...f,konten:e.target.value}))} rows={10} style={{ ...inputS, resize:'vertical', fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.6 }} onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
          </div>
          <div>
            <p style={{ fontSize:12, color:'#8090a8', marginBottom:5 }}>Tags (pisah koma)</p>
            <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="fisika, kelas 11..." style={inputS} onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
          </div>
          <button onClick={()=>{ if(!form.judul.trim()||!form.konten.trim()) return; onSave(form) }} className="btn-primary" style={{ width:'100%', padding:13, borderRadius:11, fontSize:14, fontWeight:700 }}>
            {materi?'💾 Simpan Perubahan':'+ Tambah Materi'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Materi() {
  const [list, setList]         = useState([])
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)
  const [addMode, setAddMode]   = useState('manual')
  const [aiTopic, setAiTopic]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [streamText, setStreamText]   = useState('')
  const fileRef = useRef()

  useEffect(() => {
    getMateriList().then(l => { setList(l); setPageLoading(false) })
  }, [])

  const filtered = list.filter(m =>
    m.judul.toLowerCase().includes(search.toLowerCase()) ||
    (m.tags||'').toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave(form) {
    const isEdit = modal && modal !== 'add'
    const updated = await saveMateri({ ...(isEdit?modal:{}), ...form, id:isEdit?modal.id:Date.now().toString() })
    setList(updated); setModal(null)
    await hapticSuccess()
  }

  async function handleFetchAI() {
    if (!aiTopic.trim()) return
    setLoading(true); setStreamText('')
    try {
      let full = ''
      await fetchMateriFromTopic(aiTopic, c => { full += c; setStreamText(t => t + c) })
      const updated = await saveMateri({ id:Date.now().toString(), judul:aiTopic, konten:full, tags:'ai-generated' })
      setList(updated); setModal(null); setAiTopic(''); setStreamText('')
      await hapticSuccess()
    } catch(e) { alert('Error: '+e.message) }
    setLoading(false)
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setModal({ judul:file.name.replace(/\.[^.]+$/,''), konten:ev.target.result, tags:'' })
    reader.readAsText(file)
  }

  const inputS = { width:'100%', background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:10, padding:'11px 13px', fontSize:14, color:'var(--color-text)', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' }

  if (pageLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--color-surface-3)', borderTopColor:'var(--color-neon)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding:'20px 16px', maxWidth:600, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'var(--color-text)' }}>Materi</h1>
          <p style={{ fontSize:12, color:'#8090a8', marginTop:1 }}>{list.length} tersimpan</p>
        </div>
        <button onClick={()=>{ setAddMode('manual'); setModal('add') }} className="btn-primary" style={{ padding:'8px 18px', borderRadius:10, fontSize:13, fontWeight:700 }}>+ Tambah</button>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Cari materi atau tag..." style={{ ...inputS, marginBottom:14 }} onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'52px 0' }}>
          <p style={{ fontSize:44, marginBottom:10 }}>📚</p>
          <p style={{ color:'var(--color-text-2)', fontWeight:600, marginBottom:4 }}>Belum ada materi</p>
          <p style={{ fontSize:13, color:'#8090a8' }}>Tambah manual, upload, atau minta AI cariin</p>
        </div>
      ) : filtered.map(m => (
        <div key={m.id} className="glass glass-hover" style={{ borderRadius:13, padding:'12px 14px', marginBottom:9, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>📖</span>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.judul}</p>
            <p style={{ fontSize:11, color:'#8090a8', marginTop:2 }}>{new Date(m.updatedAt).toLocaleDateString('id-ID')}{m.tags?` · ${m.tags}`:''}</p>
          </div>
          <Link to={`/materi/${m.id}`} style={{ textDecoration:'none', padding:'5px 11px', borderRadius:8, fontSize:12, color:'var(--color-neon-2)', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', whiteSpace:'nowrap' }}>Buka</Link>
          <button onClick={()=>setModal(m)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', fontSize:15, padding:4 }}>✏️</button>
          <button onClick={async()=>{ if(confirm('Hapus?')) setList(await deleteMateri(m.id)) }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', fontSize:15, padding:4 }}>🗑️</button>
        </div>
      ))}

      {modal === 'add' && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }} onClick={()=>{ setModal(null); setStreamText('') }} />
          <div className="glass animate-fade-up" style={{ position:'relative', width:'100%', maxWidth:520, borderRadius:20, border:'1px solid var(--color-border-2)', maxHeight:'88vh', overflowY:'auto' }}>
            <div style={{ padding:'15px 16px 12px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text)' }}>Tambah Materi</h3>
              <button onClick={()=>{ setModal(null); setStreamText('') }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-3)', fontSize:20 }}>×</button>
            </div>
            <div style={{ padding:'10px 16px 6px', display:'flex', gap:6 }}>
              {[['manual','✏️ Manual'],['ai','🤖 AI'],['upload','📁 Upload']].map(([k,l])=>(
                <button key={k} onClick={()=>setAddMode(k)} className={addMode===k?'btn-neon':''} style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', border:addMode===k?undefined:'1px solid var(--color-border)', background:addMode===k?undefined:'transparent', color:addMode===k?undefined:'var(--color-text-3)' }}>{l}</button>
              ))}
            </div>
            <div style={{ padding:16 }}>
              {addMode === 'manual' && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <input placeholder="Judul materi" style={inputS} id="add-judul" onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
                  <textarea placeholder="Konten (Markdown)" rows={8} style={{ ...inputS, resize:'vertical', fontFamily:'var(--font-mono)', fontSize:13 }} id="add-konten" onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
                  <input placeholder="Tags (pisah koma)" style={inputS} id="add-tags" onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
                  <button onClick={()=>{ const j=document.getElementById('add-judul').value; const k=document.getElementById('add-konten').value; const t=document.getElementById('add-tags').value; if(!j.trim()||!k.trim()) return; handleSave({judul:j,konten:k,tags:t}) }} className="btn-primary" style={{ width:'100%', padding:13, borderRadius:11, fontSize:14, fontWeight:700 }}>+ Simpan</button>
                </div>
              )}
              {addMode === 'ai' && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <p style={{ fontSize:13, color:'#8090a8' }}>Masukkan topik, AI akan cariin dari internet</p>
                  <input value={aiTopic} onChange={e=>setAiTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&handleFetchAI()} placeholder="Hukum Newton, Integral..." style={inputS} onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='var(--color-border)'} />
                  {streamText && <div style={{ background:'var(--color-surface)', borderRadius:8, padding:10, maxHeight:140, overflowY:'auto', fontSize:12, color:'var(--color-text-2)', fontFamily:'var(--font-mono)', whiteSpace:'pre-wrap' }}>{streamText}</div>}
                  <button onClick={handleFetchAI} disabled={loading||!aiTopic.trim()} className="btn-primary" style={{ width:'100%', padding:13, borderRadius:11, fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {loading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 1s linear infinite' }} />Lagi nyariin...</>:'🔍 Cari & Generate'}
                  </button>
                </div>
              )}
              {addMode === 'upload' && (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div onClick={()=>fileRef.current?.click()} style={{ border:'2px dashed var(--color-border)', borderRadius:12, padding:'36px 16px', textAlign:'center', cursor:'pointer' }}>
                    <p style={{ fontSize:36, marginBottom:8 }}>📁</p>
                    <p style={{ fontSize:14, color:'var(--color-text-2)' }}>Tap untuk pilih file</p>
                    <p style={{ fontSize:12, color:'#8090a8', marginTop:4 }}>.txt .md</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleUpload} style={{ display:'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modal && modal !== 'add' && <EditModal materi={modal} onSave={handleSave} onClose={()=>setModal(null)} />}
    </div>
  )
}
