# AI Feature Extraction & Matching

## 현재 구현

외부 유료 AI API 없이 브라우저와 Cloudflare Worker에서 실행되는 Hosted-safe baseline입니다.

- `browser-pixel-v1`: 8×8 grayscale 기반 64차원 image embedding
- dominant color 및 quantized palette
- `hash-text-v1`: 한국어 문자열 n-gram 기반 64차원 normalized embedding
- dictionary/regex 기반 category, color, material, brand, unique feature 추출
- 연락처·카드번호·식별번호 공개 설명 마스킹
- `ai_jobs` 요청 기반 처리 및 `ai_features` D1 저장
- 자연어 분실 설명 구조화 후 사용자 보정

## 후보 검색

분실 신고를 저장할 때 최대 100개의 OPEN 습득물을 조회합니다. 같은 category를 먼저 가져오고, 저장된 특징을 재사용하는 `Inference Once, Search Many` 방식입니다.

현재 Hosted 환경에는 Vectorize/FAISS가 없으므로 D1에서 후보군을 가져온 뒤 Worker에서 64차원 cosine similarity와 규칙 점수를 계산합니다. 상위 20개만 `candidate_matches`에 저장합니다.

## 재정렬 점수

가중치는 `src/matching.ts`의 `MATCHING_CONFIG`에 분리되어 있습니다.

```text
final_score =
  0.30 × semantic_text_score
+ 0.30 × visual_score
+ 0.15 × attribute_score
+ 0.10 × location_score
+ 0.10 × time_score
+ 0.05 × ocr_brand_score
```

- Text: 저장된 text embedding cosine similarity
- Visual: 분실 사진이 있으면 image embedding, 없으면 category/color 기반 visual proxy
- Attribute: category/color/material/feature 교집합
- Location: NFKC 정규화, 층/근처 표현 제거, 포함 관계와 토큰 교집합
- Time: 분실 이후 발견되었는지와 경과 시간
- OCR/Brand: 분실 brand/feature와 공개 OCR 텍스트 비교

화면에서는 점수를 확률로 표현하지 않고 `일치도 81`, `비슷한 점이 많아요`처럼 안내합니다.

## 설명 생성

외부 LLM을 사용하지 않습니다. 다음 신호를 규칙 기반 문장으로 만듭니다.

- 물건 종류 일치
- 색상 계열 일치
- 특징/장식 유사
- 장소 근접
- 분실 후 발견 시간
- 설명 유사

## 자동 재매칭

새 습득물 특징 처리가 완료되면 최근 OPEN 분실 신고를 요청 기반 `waitUntil()` 작업에서 다시 비교합니다. 사용자는 분실 신고 상세 화면에서 수동으로 `다시 찾아보기`를 실행할 수도 있습니다.

## Provider 계약과 다음 단계

- `ImageEmbeddingProvider`
- `TextEmbeddingProvider`
- `OcrProvider`
- `AttributeExtractionProvider`

다음 adapter 후보:

- LocalOpenClipProvider
- LocalMultilingualE5Provider
- PaddleOcrProvider

현재 visual proxy는 실제 cross-modal embedding이 아닙니다. OpenCLIP/e5 adapter가 연결되면 동일한 저장·점수 인터페이스를 유지하면서 text↔image 의미 비교를 고도화할 수 있습니다.
