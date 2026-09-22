type Props = { size?: 'sm' | 'md' | 'lg'; mood?: 'idle' | 'happy' | 'searching' }

export function Itlyeong({ size = 'md', mood = 'idle' }: Props) {
  const dimensions = { sm: 52, md: 88, lg: 148 }[size]
  return (
    <svg width={dimensions} height={dimensions} viewBox="0 0 160 160" role="img" aria-label="산신령 AI 마스코트 잇령이">
      <defs>
        <linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#436A4A"/><stop offset="1" stopColor="#234B37"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M27 124c15-28 30-40 53-40s40 13 53 40c-11 15-29 24-53 24s-42-9-53-24Z" fill="url(#robe)"/>
      <circle cx="80" cy="67" r="42" fill="#FFF7E8" stroke="#244C37" strokeWidth="3"/>
      <path d="M54 36c2-17 23-26 38-15 9 7 14 16 14 27-14-10-37-10-52-2Z" fill="#315A41"/>
      <path d="M91 23c8-12 18-15 27-10-3 10-10 18-22 20" fill="#6F8D58" stroke="#244C37" strokeWidth="2"/>
      <path d="M97 28c7-5 13-6 18-5" stroke="#D7E8B4" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="66" cy="64" rx="4" ry={mood === 'happy' ? 2 : 5} fill="#26372C"/>
      <ellipse cx="95" cy="64" rx="4" ry={mood === 'happy' ? 2 : 5} fill="#26372C"/>
      <path d={mood === 'happy' ? 'M71 76q9 9 18 0' : 'M74 77q6 4 12 0'} fill="none" stroke="#9B6650" strokeWidth="3" strokeLinecap="round"/>
      <path d="M53 77c0 28 14 38 27 42 15-5 28-16 28-42-8 10-17 11-27 3-10 8-20 7-28-3Z" fill="#F4F2E9" stroke="#D9D9CE" strokeWidth="2"/>
      <path d="M110 105c19-3 28 0 32 9-9 2-16 7-21 14" fill="none" stroke="#FFD26A" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"/>
      <circle cx="143" cy="114" r="5" fill="#FFE9A7" stroke="#E1AB34" strokeWidth="2"/>
      {mood === 'searching' && <path d="M24 55q-14 13 0 26M136 55q14 13 0 26" fill="none" stroke="#89A879" strokeWidth="3" strokeLinecap="round"/>}
    </svg>
  )
}
