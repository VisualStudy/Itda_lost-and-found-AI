'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Check, Clock3, ImagePlus, MapPin, Sparkles, X } from 'lucide-react'
import { categories, locationGroups } from '@/lib/locations'
import { Itlyeong } from './Itlyeong'

type UploadedImage = { id: string; publicUrl: string; thumbnailUrl: string }
const steps = ['사진', '장소', '시간', '설명', '확인']
const currentLocalDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 16)

export function FoundReportForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'wallet', foundAt: currentLocalDateTime, timePrecision: 'EXACT', locationText: '', locationGroup: '순천대학교 학생회관' })
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function upload(files: FileList | null) {
    if (!files?.length) return
    if (images.length + files.length > 5) { setError('사진은 최대 5장까지 올릴 수 있어요.'); return }
    setError(''); setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const data = new FormData(); data.append('image', file)
        const response = await fetch('/api/uploads/images', { method: 'POST', body: data })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setImages((current) => [...current, result.image])
      }
    } catch (e) { setError(e instanceof Error ? e.message : '이미지를 올리지 못했어요.') } finally { setUploading(false) }
  }

  function canContinue() {
    if (step === 0) return images.length > 0
    if (step === 1) return form.locationText.trim().length >= 2
    if (step === 2) return Boolean(form.foundAt)
    if (step === 3) return form.title.trim().length >= 2 && form.description.trim().length >= 2
    return true
  }

  async function save() {
    setError(''); setSaving(true)
    try {
      const response = await fetch('/api/found-reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, foundAt: new Date(form.foundAt).toISOString(), imageIds: images.map((image) => image.id) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      router.push(`/found/${result.report.id}?created=1`); router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : '등록하지 못했어요.') } finally { setSaving(false) }
  }

  return <section className="report-form-shell">
    <header className="form-heading"><span className="eyebrow">습득물 등록</span><h1>주운 물건을 알려주세요</h1><p>사진과 발견 정보를 남기면 잇령이가 특징을 살펴볼 준비를 해요.</p></header>
    <ol className="form-progress" aria-label="등록 진행 단계">{steps.map((label, index) => <li key={label} className={index === step ? 'current' : index < step ? 'done' : ''}><span>{index < step ? <Check size={14}/> : index + 1}</span><small>{label}</small></li>)}</ol>
    <div className="form-panel">
      {step === 0 && <div className="form-step"><div className="step-title"><Camera/><div><h2>물건 사진을 올려주세요</h2><p>전체 모습과 특징이 잘 보이도록 1~5장을 올려주세요.</p></div></div><label className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" multiple onChange={(event) => upload(event.target.files)} disabled={uploading || images.length >= 5}/><ImagePlus/><strong>{uploading ? '사진을 안전하게 처리하고 있어요…' : '사진 선택 또는 촬영'}</strong><span>JPG, PNG, WEBP, HEIC · 장당 최대 10MB</span></label>{images.length > 0 && <div className="preview-grid">{images.map((image, index) => <figure key={image.id}><img src={image.thumbnailUrl} alt={`업로드한 습득물 사진 ${index + 1}`}/><button type="button" aria-label={`사진 ${index + 1} 제외`} onClick={() => setImages(images.filter((item) => item.id !== image.id))}><X/></button><figcaption>{index === 0 ? '대표 사진' : `${index + 1}번째`}</figcaption></figure>)}</div>}<aside className="privacy-note">사진 공개본에서는 위치 정보(EXIF)를 제거해요. 카드번호나 신분증 번호는 가려서 촬영해 주세요.</aside></div>}
      {step === 1 && <div className="form-step"><div className="step-title"><MapPin/><div><h2>어디에서 발견했나요?</h2><p>건물과 층, 주변 시설까지 적으면 찾는 데 도움이 돼요.</p></div></div><label className="form-label">장소 그룹<select className="form-control" value={form.locationGroup} onChange={(e) => update('locationGroup', e.target.value)}>{locationGroups.map((item) => <option key={item.group}>{item.group}</option>)}</select></label><label className="form-label">상세 장소<input className="form-control" value={form.locationText} onChange={(e) => update('locationText', e.target.value)} placeholder="예: 학생회관 1층 소파 옆" maxLength={120}/></label><div className="place-suggestions"><span>빠른 선택</span>{locationGroups.find((item) => item.group === form.locationGroup)?.places.map((place) => <button type="button" key={place} onClick={() => update('locationText', place)}>{place}</button>)}</div></div>}
      {step === 2 && <div className="form-step"><div className="step-title"><Clock3/><div><h2>언제 발견했나요?</h2><p>정확하지 않아도 괜찮아요. 기억나는 범위를 알려주세요.</p></div></div><label className="form-label">발견 날짜와 시간<input className="form-control" type="datetime-local" value={form.foundAt} max={currentLocalDateTime} onChange={(e) => update('foundAt', e.target.value)}/></label><fieldset className="choice-group"><legend>시간 정확도</legend>{[['EXACT','정확해요'],['APPROXIMATE','대략 이쯤이에요'],['UNKNOWN','시간을 잘 모르겠어요']].map(([value,label]) => <label key={value}><input type="radio" name="precision" value={value} checked={form.timePrecision === value} onChange={(e) => update('timePrecision', e.target.value)}/><span>{label}</span></label>)}</fieldset></div>}
      {step === 3 && <div className="form-step"><div className="step-title"><Sparkles/><div><h2>물건의 특징을 적어주세요</h2><p>종류, 색상, 재질, 눈에 띄는 장식을 알려주세요.</p></div></div><label className="form-label">물건 종류<select className="form-control" value={form.category} onChange={(e) => update('category', e.target.value)}>{Object.entries(categories).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="form-label">목록에 보일 이름<input className="form-control" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="예: 검은색 카드지갑" maxLength={60}/></label><label className="form-label">발견 상황과 특징<textarea className="form-control" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="예: 소파 옆에서 발견했어요. 앞면에 작은 금색 장식이 있어요." maxLength={1000}/><small>{form.description.length}/1000</small></label></div>}
      {step === 4 && <div className="form-step review-step"><div className="mascot-review"><Itlyeong size="md" mood="searching"/><div><span className="eyebrow">등록 전 확인</span><h2>잇령이가 이렇게 준비했어요</h2><p>등록 후 로컬 AI 분석 대기열에 추가돼요. 분석에 실패해도 신고는 정상 등록됩니다.</p></div></div><div className="review-grid"><div><span>사진</span><strong>{images.length}장</strong></div><div><span>물건</span><strong>{categories[form.category]} · {form.title}</strong></div><div><span>발견 장소</span><strong>{form.locationText}</strong></div><div><span>발견 시간</span><strong>{new Date(form.foundAt).toLocaleString('ko-KR')}</strong></div></div><article className="description-review"><span>설명</span><p>{form.description}</p></article></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="form-actions">{step > 0 ? <button type="button" className="button button-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={18}/> 이전</button> : <span/>}{step < steps.length - 1 ? <button type="button" className="button button-primary" disabled={!canContinue() || uploading} onClick={() => { setError(''); setStep(step + 1) }}>다음 <ArrowRight size={18}/></button> : <button type="button" className="button button-primary" disabled={saving} onClick={save}>{saving ? '등록하고 있어요…' : '습득물 등록하기'} <Check size={18}/></button>}</footer>
    </div>
  </section>
}
