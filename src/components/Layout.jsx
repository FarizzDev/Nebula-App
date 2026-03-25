import { Outlet, NavLink } from 'react-router-dom'

const NAV = [
  { to:'/', exact:true, label:'Home', icon:'⌂' },
  { to:'/materi',   label:'Materi',   icon:'📖' },
  { to:'/chat',     label:'Chat',     icon:'💬' },
  { to:'/soal',     label:'Soal',     icon:'📝' },
  { to:'/reminder', label:'PR',       icon:'⏰' },
  { to:'/settings', label:'Setting',  icon:'⚙️' },
]

const HEADER_H = 52
const NAV_H    = 62

export { HEADER_H, NAV_H }

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        position: 'fixed', top:0, left:0, right:0, zIndex:50,
        height: HEADER_H,
        background: 'rgba(7,7,26,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(59,130,246,0.1)',
        display: 'flex', alignItems: 'center', padding: '0 16px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:30, height:30, borderRadius:'50%',
            background:'linear-gradient(135deg,#3b82f6,#818cf8)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }} className="animate-pulse-glow">
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#07071a' }} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:19, letterSpacing:0.5 }} className="glow-text">
            Nebula
          </span>
        </div>
      </header>

      {/* Content — top offset = header, bottom offset = nav */}
      <main style={{ flex:1, paddingTop: HEADER_H, paddingBottom: NAV_H }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="mobile-nav" style={{ height: NAV_H }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:2, padding:'4px 2px', textDecoration:'none', position:'relative' }}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                    width:28, height:2, borderRadius:1,
                    background:'linear-gradient(90deg,#3b82f6,#818cf8)',
                    boxShadow:'0 0 8px rgba(59,130,246,0.8)',
                  }} />
                )}
                <span style={{ fontSize:20, lineHeight:1, filter: isActive ? 'drop-shadow(0 0 6px rgba(96,165,250,0.7))' : 'none', transition:'filter 0.2s' }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize:10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-neon-2)' : 'var(--color-text-3)',
                  transition:'color 0.2s',
                  textShadow: isActive ? '0 0 10px rgba(96,165,250,0.5)' : 'none',
                }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
