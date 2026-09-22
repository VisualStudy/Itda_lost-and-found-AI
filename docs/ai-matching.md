# AI Feature Extraction

## 구현됨

- `browser-pixel-v1`: 8×8 grayscale 기반 64차원 image embedding
- dominant color 및 quantized palette
- `hash-text-v1`: 한국어 문자열 n-gram 기반 64차원 normalized embedding
- `dictionary-attributes-v1`: category, color, material, unique feature 추출
- `ai_jobs` 상태 처리
- `ai_features` D1 저장

모두 브라우저/Worker에서 동작하며 외부 유료 AI API가 없습니다.

## Provider 계약

- `ImageEmbeddingProvider`
- `TextEmbeddingProvider`
- `OcrProvider`
- `AttributeExtractionProvider`

## 다음 adapter

- LocalOpenClipProvider
- LocalMultilingualE5Provider
- PaddleOcrProvider

현재 baseline은 Hosted에서 즉시 실행되는 fallback입니다. 고급 모델이 실패하거나 연결되지 않아도 신고 등록과 후보 검색에 사용할 기본 특징은 유지됩니다.
