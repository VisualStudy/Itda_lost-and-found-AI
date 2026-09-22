import type { Child } from 'hono/jsx'

export type ItchiPose = 'greet' | 'search' | 'fly' | 'found' | 'sad' | 'sleep' | 'scan' | 'wink' | 'point' | 'rest'

type EyeState = 'open' | 'happy' | 'wink' | 'sleep' | 'sad' | 'search'
type MouthState = 'smile' | 'open' | 'small'
type ArmState = 'rest' | 'wave' | 'celebrate' | 'hold' | 'point' | 'droop'

export const ItchiColors = {
  body: '#262B48', belly: '#FFFFFF', beak: '#F6C744', beakDark: '#E0AE22',
  cheek: '#F49A9A', feet: '#F6C744', bag: '#B6E0C8', bagStrap: '#7EC29A',
  bagBuckle: '#F6C744', eye: '#1A1E36', eyeShine: '#FFFFFF', outline: '#1A1E36',
} as const

function Eyes({ state }: { state: EyeState }) {
  const C = ItchiColors
  if (state === 'happy') return <><path d="M74 94Q80 86 86 94" stroke={C.eye} stroke-width="3" fill="none" stroke-linecap="round"/><path d="M114 94Q120 86 126 94" stroke={C.eye} stroke-width="3" fill="none" stroke-linecap="round"/></>
  if (state === 'wink') return <><circle cx="80" cy="92" r="6" fill={C.eye}/><circle cx="82" cy="90" r="1.8" fill={C.eyeShine}/><path d="M114 94Q120 86 126 94" stroke={C.eye} stroke-width="3" fill="none" stroke-linecap="round"/></>
  if (state === 'sleep') return <><path d="M74 92Q80 96 86 92" stroke={C.eye} stroke-width="3" fill="none" stroke-linecap="round"/><path d="M114 92Q120 96 126 92" stroke={C.eye} stroke-width="3" fill="none" stroke-linecap="round"/></>
  if (state === 'sad') return <><ellipse cx="80" cy="94" rx="5" ry="6" fill={C.eye}/><ellipse cx="120" cy="94" rx="5" ry="6" fill={C.eye}/><circle cx="78" cy="91" r="1.5" fill={C.eyeShine}/><circle cx="118" cy="91" r="1.5" fill={C.eyeShine}/><path d="M84 100Q86 108 82 110Q78 108 82 100Z" fill="#7DB8E8" opacity=".9"/></>
  const glance = state === 'search' ? 3 : 2
  return <><circle cx="80" cy="92" r="6" fill={C.eye}/><circle cx="120" cy="92" r="6" fill={C.eye}/><circle cx={80 + glance} cy={state === 'search' ? 93 : 90} r="1.8" fill={C.eyeShine}/><circle cx={120 + glance} cy={state === 'search' ? 93 : 90} r="1.8" fill={C.eyeShine}/></>
}

function Beak({ state }: { state: MouthState }) {
  const C = ItchiColors
  if (state === 'open') return <><path d="M88 108L112 108Q108 128 100 128Q92 128 88 108Z" fill={C.beak} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/><path d="M92 118Q100 124 108 118" stroke={C.beakDark} stroke-width="1.5" fill={C.beakDark} opacity=".5"/></>
  if (state === 'small') return <path d="M96 110L104 110L100 116Z" fill={C.beak} stroke={C.outline} stroke-width="1.8" stroke-linejoin="round"/>
  return <path d="M92 108L108 108L100 118Z" fill={C.beak} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/>
}

function Arms({ state }: { state: ArmState }) {
  const C = ItchiColors
  if (state === 'wave') return <><path d="M45 128Q32 148 48 168Q55 162 55 150Z" fill={C.body} stroke={C.outline} stroke-width="2"/><g class="itchi-wave-arm"><path d="M152 118Q178 88 186 62Q174 60 168 74Q158 96 148 118Z" fill={C.body} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/><path d="M174 68Q180 60 186 62Q184 74 178 78Z" fill={C.belly} stroke={C.outline} stroke-width="1.5"/></g></>
  if (state === 'celebrate') return <><path d="M48 120Q22 92 18 66Q30 60 40 74Q50 96 60 120Z" fill={C.body} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/><path d="M22 72Q18 62 26 58Q32 68 30 78Z" fill={C.belly} stroke={C.outline} stroke-width="1.5"/><path d="M152 120Q178 92 182 66Q170 60 160 74Q150 96 140 120Z" fill={C.body} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/><path d="M178 72Q182 62 174 58Q168 68 170 78Z" fill={C.belly} stroke={C.outline} stroke-width="1.5"/></>
  if (state === 'hold') return <><path d="M55 130Q62 158 82 158Q82 142 66 130Z" fill={C.body} stroke={C.outline} stroke-width="2"/><path d="M145 130Q138 158 118 158Q118 142 134 130Z" fill={C.body} stroke={C.outline} stroke-width="2"/></>
  if (state === 'point') return <><path d="M45 128Q32 148 48 168Q55 162 55 150Z" fill={C.body} stroke={C.outline} stroke-width="2"/><path d="M152 130Q178 128 194 138Q188 148 172 148Q162 146 148 148Z" fill={C.body} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/><path d="M188 138Q196 138 196 144Q190 148 184 146Z" fill={C.belly} stroke={C.outline} stroke-width="1.5"/></>
  if (state === 'droop') return <><path d="M48 138Q40 176 56 182Q62 170 58 156Z" fill={C.body} stroke={C.outline} stroke-width="2"/><path d="M152 138Q160 176 144 182Q138 170 142 156Z" fill={C.body} stroke={C.outline} stroke-width="2"/></>
  return <><path d="M45 128Q32 148 48 168Q55 162 55 150Z" fill={C.body} stroke={C.outline} stroke-width="2"/><path d="M155 128Q168 148 152 168Q145 162 145 150Z" fill={C.body} stroke={C.outline} stroke-width="2"/></>
}

function Magnifier() {
  const C = ItchiColors
  return <g class="itchi-magnifier"><line x1="152" y1="158" x2="176" y2="182" stroke="#8B5E3C" stroke-width="6" stroke-linecap="round"/><line x1="152" y1="158" x2="176" y2="182" stroke="#5C3E24" stroke-width="2" stroke-linecap="round"/><circle cx="140" cy="146" r="20" fill="#E8F4FF" stroke={C.outline} stroke-width="3" opacity=".9"/><circle cx="134" cy="140" r="6" fill="#fff" opacity=".9"/></g>
}

function Phone() {
  const C = ItchiColors
  return <g><rect x="115" y="132" width="30" height="46" rx="6" fill="#F8F5EA" stroke={C.outline} stroke-width="2"/><rect x="119" y="138" width="22" height="30" rx="2" fill={C.bag}/><circle cx="130" cy="173" r="1.8" fill={C.outline}/><path d="M121 140L121 158L124 155L124 143Z" fill="#fff" opacity=".5"/></g>
}

function Confetti() {
  const bits = [
    { x: 20, y: 40, c: '#F6C744', r: 15 }, { x: 180, y: 50, c: '#F49A9A', r: -20 },
    { x: 12, y: 100, c: '#B6E0C8', r: 30 }, { x: 188, y: 110, c: '#F6C744', r: -10 },
    { x: 30, y: 160, c: '#F49A9A', r: 45 }, { x: 170, y: 170, c: '#B6E0C8', r: -30 },
    { x: 100, y: 20, c: '#F6C744', r: 0 },
  ]
  return <g class="itchi-confetti">{bits.map((bit) => <g transform={`translate(${bit.x} ${bit.y}) rotate(${bit.r})`}><rect x="-4" y="-2" width="8" height="4" rx="1" fill={bit.c}/></g>)}<text x="40" y="60" font-size="14" fill="#F6C744">★</text><text x="160" y="80" font-size="12" fill="#F49A9A">★</text><text x="30" y="140" font-size="10" fill="#B6E0C8">★</text></g>
}

function ScanRings() {
  return <g><circle class="itchi-pulse-ring" cx="100" cy="115" r="72" fill="none" stroke="#B6E0C8" stroke-width="2" opacity=".6"/><circle class="itchi-pulse-ring itchi-pulse-delay" cx="100" cy="115" r="72" fill="none" stroke="#F6C744" stroke-width="2" opacity=".5"/></g>
}

function Zzz() {
  return <g class="itchi-zzz"><text x="140" y="60" font-size="16" font-weight="700" fill="#8A90AE">z</text><text x="152" y="46" font-size="20" font-weight="700" fill="#8A90AE">Z</text><text x="168" y="30" font-size="24" font-weight="700" fill="#8A90AE">Z</text></g>
}

function ItchiBody({ eyes, mouth, arms, extras }: { eyes: EyeState; mouth: MouthState; arms: ArmState; extras?: Child }) {
  const C = ItchiColors
  return <g>
    <ellipse cx="100" cy="188" rx="42" ry="5" fill="rgba(38,43,72,.14)"/>
    <path d="M60 78Q100 60 140 78" fill="none" stroke={C.bagStrap} stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="100" cy="115" rx="62" ry="65" fill={C.body} stroke={C.outline} stroke-width="2.5"/>
    <ellipse cx="100" cy="135" rx="34" ry="42" fill={C.belly}/>
    <path d="M148 108Q165 118 155 138Q150 128 145 130Z" fill={C.belly} stroke={C.outline} stroke-width="2" stroke-linejoin="round"/>
    <Arms state={arms}/>
    <g><rect x="118" y="140" width="34" height="30" rx="6" fill={C.bag} stroke={C.outline} stroke-width="2"/><path d="M118 148V146Q118 140 124 140H146Q152 140 152 146V148Z" fill={C.bagStrap}/><circle cx="135" cy="156" r="3" fill={C.bagBuckle} stroke={C.outline} stroke-width="1.2"/></g>
    <g stroke={C.outline} stroke-width="1.6" stroke-linecap="round"><path d="M86 180V192M82 192L78 196M86 192V197M90 192L94 196M114 180V192M110 192L106 196M114 192V197M118 192L122 196" stroke={C.feet} stroke-width="3.5"/></g>
    <ellipse cx="66" cy="102" rx="9" ry="6" fill={C.cheek} opacity=".85"/><ellipse cx="134" cy="102" rx="9" ry="6" fill={C.cheek} opacity=".85"/>
    <Eyes state={eyes}/><Beak state={mouth}/>{extras}
  </g>
}

const poseConfig: Record<ItchiPose, { eyes: EyeState; mouth: MouthState; arms: ArmState; extra?: 'magnifier' | 'phone' | 'confetti' | 'scan' | 'zzz'; animation?: string; label: string }> = {
  greet: { eyes: 'happy', mouth: 'smile', arms: 'wave', animation: 'itchi-bob', label: '반갑게 인사하는 잇치' },
  search: { eyes: 'search', mouth: 'small', arms: 'hold', extra: 'magnifier', animation: 'itchi-bob', label: '돋보기로 꼼꼼하게 찾는 잇치' },
  fly: { eyes: 'open', mouth: 'small', arms: 'celebrate', extra: 'phone', animation: 'itchi-float', label: '새 소식을 전하러 날아가는 잇치' },
  found: { eyes: 'happy', mouth: 'open', arms: 'celebrate', extra: 'confetti', animation: 'itchi-celebrate', label: '닮은 물건을 찾아 기뻐하는 잇치' },
  sad: { eyes: 'sad', mouth: 'small', arms: 'droop', animation: 'itchi-float', label: '다시 시도해 달라고 말하는 잇치' },
  sleep: { eyes: 'sleep', mouth: 'small', arms: 'rest', extra: 'zzz', animation: 'itchi-float', label: '잠깐 쉬고 있는 잇치' },
  scan: { eyes: 'open', mouth: 'small', arms: 'hold', extra: 'scan', label: '사진을 살펴보는 잇치' },
  wink: { eyes: 'wink', mouth: 'smile', arms: 'rest', animation: 'itchi-bob', label: '윙크하는 잇치' },
  point: { eyes: 'open', mouth: 'small', arms: 'point', animation: 'itchi-bob', label: '다음 단계를 안내하는 잇치' },
  rest: { eyes: 'open', mouth: 'smile', arms: 'rest', label: '편안히 서 있는 잇치' },
}

export function Itchi({ pose = 'greet', size = 160, animate = true, className = '' }: { pose?: ItchiPose; size?: number; animate?: boolean; className?: string }) {
  const config = poseConfig[pose]
  const extras = config.extra === 'magnifier' ? <Magnifier/> : config.extra === 'phone' ? <Phone/> : config.extra === 'confetti' ? <Confetti/> : config.extra === 'scan' ? <><Phone/><ScanRings/></> : config.extra === 'zzz' ? <Zzz/> : undefined
  return <span class={`itchi-wrap ${className}`} role="img" aria-label={config.label}><svg width={size} height={size} viewBox="0 0 200 200" class={animate && config.animation ? config.animation : ''} aria-hidden="true"><ItchiBody eyes={config.eyes} mouth={config.mouth} arms={config.arms} extras={extras}/></svg></span>
}

export function ItchiSays({ children, tone = 'default' }: { children: Child; tone?: 'default' | 'mint' | 'yolk' | 'coral' }) {
  return <div class={`bubble bubble-${tone}`}>{children}</div>
}
