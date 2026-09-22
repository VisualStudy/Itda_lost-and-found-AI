(() => {
  'use strict'

  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

  $('[data-logout]')?.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    location.href = '/'
  })

  const authForm = $('[data-auth-form]')
  if (authForm) {
    authForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const error = $('[data-form-error]', authForm)
      const button = $('button[type="submit"]', authForm)
      error.hidden = true; button.disabled = true; button.textContent = '잠시만요…'
      try {
        const payload = Object.fromEntries(new FormData(authForm).entries())
        const response = await fetch(`/api/auth/${authForm.dataset.mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요.')
        const next = new URLSearchParams(location.search).get('next')
        location.href = next && next.startsWith('/') ? next : '/home'
      } catch (problem) {
        error.textContent = problem.message; error.hidden = false
        button.disabled = false; button.textContent = authForm.dataset.mode === 'register' ? '잇다 시작하기 →' : '로그인 →'
      }
    })
  }

  const foundForm = $('[data-found-form]')
  if (foundForm) setupFoundForm(foundForm)

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined))

  function setupFoundForm(form) {
    let step = 0
    let files = []
    const steps = $$('[data-step]', form)
    const progress = $$('.form-progress li')
    const previous = $('[data-prev]', form)
    const next = $('[data-next]', form)
    const submit = $('[data-submit]', form)
    const error = $('[data-form-error]', form)
    const preview = $('[data-preview]', form)
    const input = $('#found-images', form)
    const foundAt = $('[name="foundAt"]', form)
    const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    foundAt.value = localNow; foundAt.max = localNow

    input.addEventListener('change', () => {
      const selected = [...input.files]
      if (files.length + selected.length > 5) return showError('사진은 최대 5장까지 올릴 수 있어요.')
      files.push(...selected); input.value = ''; renderPreview(); clearError()
    })
    previous.addEventListener('click', () => showStep(step - 1))
    next.addEventListener('click', () => {
      if (!validateStep()) return
      if (step === 3) renderReview()
      showStep(step + 1)
    })
    form.addEventListener('submit', save)

    function renderPreview() {
      preview.replaceChildren(...files.map((file, index) => {
        const figure = document.createElement('figure')
        const image = document.createElement('img'); image.src = URL.createObjectURL(file); image.alt = `선택한 습득물 사진 ${index + 1}`
        const remove = document.createElement('button'); remove.type = 'button'; remove.setAttribute('aria-label', `사진 ${index + 1} 제외`); remove.textContent = '×'
        remove.addEventListener('click', () => { URL.revokeObjectURL(image.src); files.splice(index, 1); renderPreview() })
        const caption = document.createElement('figcaption'); caption.textContent = index === 0 ? '대표 사진' : `${index + 1}번째`
        figure.append(image, remove, caption); return figure
      }))
    }
    function showStep(value) {
      step = Math.max(0, Math.min(4, value))
      steps.forEach((section, index) => { section.hidden = index !== step })
      progress.forEach((item, index) => { item.classList.toggle('current', index === step); item.classList.toggle('done', index < step) })
      previous.hidden = step === 0; next.hidden = step === 4; submit.hidden = step !== 4; clearError()
      scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' })
    }
    function validateStep() {
      if (step === 0 && files.length < 1) return showError('사진을 한 장 이상 선택해 주세요.')
      if (step === 1 && $('[name="locationText"]', form).value.trim().length < 2) return showError('상세 장소를 입력해 주세요.')
      if (step === 2 && !foundAt.value) return showError('발견 시간을 입력해 주세요.')
      if (step === 3 && (!$('[name="title"]', form).checkValidity() || !$('[name="description"]', form).checkValidity())) return showError('물건 이름과 설명을 확인해 주세요.')
      clearError(); return true
    }
    function renderReview() {
      const data = new FormData(form)
      const review = $('[data-review]', form)
      const category = $('[name="category"] option:checked', form).textContent
      review.innerHTML = `<div><span>사진</span><strong>${files.length}장</strong></div><div><span>물건</span><strong>${escapeHtml(category)} · ${escapeHtml(data.get('title'))}</strong></div><div><span>발견 장소</span><strong>${escapeHtml(data.get('locationText'))}</strong></div><div><span>발견 시간</span><strong>${escapeHtml(new Date(data.get('foundAt')).toLocaleString('ko-KR'))}</strong></div><article class="description-review"><span>설명</span><p>${escapeHtml(data.get('description'))}</p></article>`
    }
    async function save(event) {
      event.preventDefault(); clearError(); submit.disabled = true; submit.textContent = '사진을 안전하게 처리하고 있어요…'
      try {
        const imageIds = []
        for (let index = 0; index < files.length; index++) {
          submit.textContent = `사진 ${index + 1}/${files.length} 처리 중…`
          const processed = await preprocessImage(files[index])
          const upload = new FormData(); upload.append('original', files[index]); upload.append('public', processed.publicBlob, 'public-clean.webp'); upload.append('thumbnail', processed.thumbnailBlob, 'thumbnail.webp'); upload.append('width', String(processed.width)); upload.append('height', String(processed.height)); upload.append('features', JSON.stringify(processed.features))
          const response = await fetch('/api/uploads/images', { method: 'POST', body: upload })
          const result = await response.json(); if (!response.ok) throw new Error(result.error)
          imageIds.push(result.image.id)
        }
        submit.textContent = '습득물 등록 중…'
        const data = new FormData(form)
        const payload = { title: data.get('title'), description: data.get('description'), category: data.get('category'), foundAt: new Date(data.get('foundAt')).toISOString(), timePrecision: data.get('timePrecision'), locationText: data.get('locationText'), locationGroup: data.get('locationGroup'), imageIds }
        const response = await fetch('/api/found-reports', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
        const result = await response.json(); if (!response.ok) throw new Error(result.error)
        location.href = `/found/${result.report.id}?created=1`
      } catch (problem) {
        showError(problem.message || '등록하지 못했어요.'); submit.disabled = false; submit.textContent = '습득물 등록하기 ✓'
      }
    }
    function showError(message) { error.textContent = message; error.hidden = false; return false }
    function clearError() { error.hidden = true; error.textContent = '' }
  }

  async function preprocessImage(file) {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale)); const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true }); context.fillStyle = '#fff'; context.fillRect(0, 0, width, height); context.drawImage(bitmap, 0, 0, width, height)
    const thumbnail = document.createElement('canvas'); thumbnail.width = 560; thumbnail.height = 420
    const thumbContext = thumbnail.getContext('2d', { alpha: false }); thumbContext.fillStyle = '#eef0e8'; thumbContext.fillRect(0, 0, 560, 420)
    const cover = Math.max(560 / bitmap.width, 420 / bitmap.height); const drawWidth = bitmap.width * cover; const drawHeight = bitmap.height * cover
    thumbContext.drawImage(bitmap, (560 - drawWidth) / 2, (420 - drawHeight) / 2, drawWidth, drawHeight)
    const features = extractPixelFeatures(canvas)
    bitmap.close()
    return { width, height, publicBlob: await canvasBlob(canvas, .84), thumbnailBlob: await canvasBlob(thumbnail, .78), features }
  }

  function extractPixelFeatures(source) {
    const sample = document.createElement('canvas'); sample.width = 8; sample.height = 8
    const context = sample.getContext('2d', { willReadFrequently: true }); context.drawImage(source, 0, 0, 8, 8)
    const pixels = context.getImageData(0, 0, 8, 8).data
    const embedding = []; const buckets = new Map(); let red = 0; let green = 0; let blue = 0
    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2]
      embedding.push(Number(((.299 * r + .587 * g + .114 * b) / 255).toFixed(4)))
      red += r; green += g; blue += b
      const key = `${Math.round(r / 64) * 64},${Math.round(g / 64) * 64},${Math.round(b / 64) * 64}`; buckets.set(key, (buckets.get(key) || 0) + 1)
    }
    const mean = embedding.reduce((sum, value) => sum + value, 0) / embedding.length
    const centered = embedding.map((value) => value - mean); const norm = Math.hypot(...centered) || 1
    const average = [red / 64, green / 64, blue / 64]
    return { embedding: centered.map((value) => Number((value / norm).toFixed(5))), dominantColors: classifyColors(average), palette: [...buckets.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([rgb]) => rgb) }
  }

  function classifyColors([r,g,b]) {
    const max = Math.max(r,g,b), min = Math.min(r,g,b), colors = []
    if (max < 70) colors.push('black'); else if (min > 205) colors.push('white'); else if (max - min < 28) colors.push(max > 150 ? 'gray' : 'black'); else if (r > g * 1.25 && r > b * 1.25) colors.push(r > 170 && g > 110 ? 'brown' : 'red'); else if (b > r * 1.2 && b > g * 1.1) colors.push('blue'); else if (g > r * 1.15 && g > b * 1.1) colors.push('green'); else if (r > 165 && g > 145 && b < 130) colors.push('yellow'); else colors.push('other')
    return colors
  }

  function canvasBlob(canvas, quality) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('이미지를 변환하지 못했어요.')), 'image/webp', quality)) }
  function escapeHtml(value) { const element = document.createElement('div'); element.textContent = String(value || ''); return element.innerHTML }
})()
