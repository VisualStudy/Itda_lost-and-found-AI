# Itda AI Matching Plan

## 원칙

- 외부 유료 LLM/Vision API 없이 핵심 기능 동작
- Inference Once, Search Many
- AI는 소유권을 확정하지 않고 후보와 근거만 제시
- 점수는 확률이 아니라 **일치도**로 표기
- AI 처리 실패 시에도 신고 CRUD와 기본 검색 유지

## Phase 3 Feature Extraction

### 기본 Provider

```text
ImageEmbeddingProvider
└─ LocalOpenClipProvider (default)

TextEmbeddingProvider
└─ LocalMultilingualEmbeddingProvider (multilingual-e5 또는 BGE)

OcrProvider
└─ PaddleOCRProvider → Tesseract fallback

AttributeExtractor
└─ dictionary + regex + embedding similarity
```

### Found 처리

```text
Found image
→ public-clean 512~768px 입력
→ image embedding
→ OCR
→ privacy filter(public/private 분리)
→ category/color/material/feature 추출
→ ai_features 저장
→ ai_status READY
```

현재 Phase 2에서 `EXTRACT_FEATURES` job이 `PENDING`으로 생성됩니다.

## Phase 4 Lost 처리

자연어 설명에서 category, colors, brand, material, features, location, time을 규칙 기반으로 먼저 추출하고 multilingual embedding을 생성합니다. 사용자가 구조화 결과를 수정한 후 저장합니다.

## Phase 5 Retrieval과 Scoring

초기 후보는 category/location/time filter와 vector similarity로 50~100개를 조회합니다.

```text
final_score =
  0.30 * semantic_text_score
+ 0.30 * visual_score
+ 0.15 * attribute_score
+ 0.10 * location_score
+ 0.10 * time_score
+ 0.05 * ocr_brand_score
```

가중치는 환경/설정 파일로 분리하고 scoring은 pure function으로 구현·테스트합니다.

## 설명 생성

외부 LLM 대신 rule template을 사용합니다.

- 물건 종류가 같습니다.
- 검정색 계열이 일치합니다.
- 금색 장식이 유사합니다.
- 발견 위치가 분실 위치와 가깝습니다.
- 분실 후 40분 이내에 발견되었습니다.

UI 문구는 `일치도 87`, `비슷한 정도가 높아요`처럼 표현하며 확률 또는 확정 표현을 사용하지 않습니다.

## 개인정보 필터

OCR 결과는 `public_features`와 `private_features`로 분리합니다. 카드번호, 전화번호, 주민등록번호, 학생증/신분증 번호 패턴은 공개 feature에서 제거합니다.
