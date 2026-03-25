import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { getMateriList, getChatHistory, saveChatHistory } from '../lib/store'
import { chat } from '../lib/gemini'

export default function Chat() {
  const [input, setInput]           = useState('')
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [selectedMateri, setSelectedMateri] = useState('general')
  const [materiList, setMateriList] = useState([])
  const [useSearch, setUseSearch]   = useState(false)
  const chatEndRef = useRef()
  const inputRef   = useRef()

  useEffect(() => {
    async function load() {
      const [l, h] = await Promise.all([getMateriList(), getChatHistory('general')])
      setMateriList(l); setHistory(h)
    }
    load()
  }, [])

  useEffect(() => {
    getChatHistory(selectedMateri).then(setHistory)
  }, [selectedMateri])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [history])

  const selectedMateriObj = materiList.find(m => m.id === selectedMateri)

  async function handleSend() {
    if (!input.trim() || loading) return
    const userText = input.trim(); setInput(''); setLoading(true)
    const geminiHistory = history.map(m => ({ role:m.role, parts:[{ text:m.text }] }))
    const newHistory    = [...history, { role:'user', text:userText }]
    setHistory([...newHistory, { role:'model', text:'', streaming:true }])
    try {
      let full = ''
      await chat({ history:geminiHistory, userMessage:userText, materiContext:selectedMateriObj?.konten, useSearch,
        onStream: c => { full+=c; setHistory(h => { const u=[...h]; u[u.length-1]={ role:'model', text:full, streaming:true }; return u }) }
      })
      const final = [...newHistory, { role:'model', text:full }]
      setHistory(final); await saveChatHistory(selectedMateri, final)
    } catch(e) { setHistory(h => { const u=[...h]; u[u.length-1]={ role:'model', text:'❌ '+e.message }; return u }) }
    setLoading(false); inputRef.current?.focus()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 120px)' }}>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:10, background:'rgba(7,7,26,0.8)', backdropFilter:'blur(10px)' }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }} className="animate-pulse-glow">🤖</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--color-text)' }}>Nebula AI</p>
          <p style={{ fontSize:11, color:'#8090a8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {selectedMateriObj?`📖 ${selectedMateriObj.judul}`:'Chat bebas'}{useSearch?' · 🔍':''}
          </p>
        </div>
        <select value={selectedMateri} onChange={e=>setSelectedMateri(e.target.value)} style={{ background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, padding:'4px 8px', fontSize:11, color:'var(--color-text-2)', maxWidth:100 }}>
          <option value="general">Bebas</option>
          {materiList.map(m=><option key={m.id} value={m.id}>{m.judul}</option>)}
        </select>
        <button onClick={()=>setUseSearch(s=>!s)} style={{ padding:'4px 8px', borderRadius:8, fontSize:14, cursor:'pointer', border:'1px solid var(--color-border)', background:useSearch?'rgba(59,130,246,0.2)':'transparent' }}>🔍</button>
        <button onClick={async()=>{ if(confirm('Hapus chat?')){ setHistory([]); await saveChatHistory(selectedMateri,[]) } }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--color-text-3)' }}>🗑️</button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
        {history.length === 0 && (
          <div style={{ textAlign:'center', padding:'32px 0' }} className="stagger">
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 12px' }} className="animate-pulse-glow">🌌</div>
            <p style={{ fontSize:15, fontWeight:600, color:'var(--color-text-2)', marginBottom:4 }}>Hai! Aku Nebula</p>
            <p style={{ fontSize:13, color:'#8090a8', marginBottom:16 }}>Tanya apa aja, siap bantu!</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
              {['Jelasin rekursi','Apa itu AI?','Cara kerja DNS','Contoh soal fisika'].map(s=>(
                <button key={s} onClick={()=>setInput(s)} className="glass glass-hover" style={{ padding:'6px 12px', borderRadius:20, fontSize:12, color:'var(--color-text-2)', cursor:'pointer', border:'1px solid var(--color-border)' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {history.map((msg,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', marginBottom:12, gap:8 }} className="animate-fade-up">
            {msg.role==='model' && <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#818cf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, marginTop:2 }}>🤖</div>}
            <div style={{ maxWidth:'82%', padding:'9px 13px', borderRadius:14, fontSize:13, lineHeight:1.55, background:msg.role==='user'?'rgba(59,130,246,0.14)':'var(--color-surface-2)', border:`1px solid ${msg.role==='user'?'rgba(59,130,246,0.28)':'var(--color-border)'}`, color:'var(--color-text)' }}>
              {msg.role==='model'?<div className="markdown"><ReactMarkdown>{msg.text||'...'}</ReactMarkdown></div>:<p style={{ whiteSpace:'pre-wrap' }}>{msg.text}</p>}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding:'10px 16px', borderTop:'1px solid var(--color-border)', background:'rgba(7,7,26,0.8)', backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSend() } }}
            placeholder="Ketik pesan... (Enter kirim)" rows={1}
            style={{ flex:1, background:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:12, padding:'10px 14px', fontSize:14, color:'var(--color-text)', resize:'none', outline:'none', maxHeight:100, fontFamily:'inherit' }}
            onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px' }} />
          <button onClick={handleSend} disabled={!input.trim()||loading} className="btn-primary" style={{ width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
            {loading?<div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 1s linear infinite' }} />:'↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
