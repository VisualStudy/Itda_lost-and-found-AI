export type DetectedAttributes = {
  category: string
  colors: string[]
  material: string | null
  features: string[]
}

export interface TextEmbeddingProvider {
  readonly id: string
  readonly modelVersion: string
  embed(text: string): Promise<number[]> | number[]
}

export interface ImageEmbeddingProvider {
  readonly id: string
  readonly modelVersion: string
  embed(image: ArrayBuffer): Promise<number[]>
}

export interface OcrProvider {
  readonly id: string
  readonly modelVersion: string
  recognize(image: ArrayBuffer): Promise<{ publicText: string[]; privateText: string[] }>
}

export interface AttributeExtractionProvider {
  readonly id: string
  readonly modelVersion: string
  extract(text: string, fallbackCategory?: string): Promise<DetectedAttributes> | DetectedAttributes
}

// Hosted baseline: browser pixel embedding + Worker hash text embedding.
// Phase 3 self-hosted adapters implement the same contracts with OpenCLIP,
// multilingual-e5/BGE and PaddleOCR without changing report APIs or D1 schema.
export const providerPlan = {
  current: ['browser-pixel-v1', 'hash-text-v1', 'dictionary-attributes-v1'],
  next: ['local-openclip', 'multilingual-e5-small', 'paddleocr'],
} as const
