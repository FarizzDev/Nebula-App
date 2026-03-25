import { useMemo } from 'react'

export default function Stars() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    opacity: 0.2 + Math.random() * 0.5,
    size: Math.random() > 0.85 ? 3 : 2,
  })), [])

  return (
    <div className="stars">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          '--duration': `${s.duration}s`,
          '--delay': `${s.delay}s`,
          '--opacity': s.opacity,
        }} />
      ))}
    </div>
  )
}
