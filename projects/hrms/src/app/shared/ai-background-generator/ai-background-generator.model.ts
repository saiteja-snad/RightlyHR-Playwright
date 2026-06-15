// ─── REQUEST ─────────────────────────────────────────────────────────────────
export interface AiGenerateBackgroundRequest {
  image_base64: string;       // Base64 encoded image (without data: prefix)
}

// ─── RESPONSE ────────────────────────────────────────────────────────────────
export interface AiGeneratedBackground {
  id: string;
  image_base64: string;       // Base64 encoded generated image
  label?: string;
}

export interface AiGenerateBackgroundResponse {
  success: boolean;
  message?: string;
  data: AiGeneratedBackground[];
}

// ─── UI MODELS ───────────────────────────────────────────────────────────────
export interface BackgroundTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  prompt: string;
}

export interface GeneratedVariation {
  id: string;
  image_base64: string;
  dataUrl: string;
  label: string;
  sublabel?: string;
  selected: boolean;
}
