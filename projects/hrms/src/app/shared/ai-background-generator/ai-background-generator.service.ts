import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AiGenerateBackgroundRequest,
  AiGenerateBackgroundResponse,
  BackgroundTemplate,
} from './ai-background-generator.model';

@Injectable({ providedIn: 'root' })
export class AiBackgroundService {

  private readonly apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) {}

  getTemplates(): BackgroundTemplate[] {
    return [
      { id: 'default',  title: 'Default',        description: 'Teams soft blue-grey',    icon: '🔵', gradient: 'linear-gradient(135deg,#c8d3e0,#b0bdd0)', prompt: 'Soft blue-grey gradient background, clean professional Microsoft Teams style, subtle radial glow, minimal and elegant' },
      { id: 'office',   title: 'Executive Office', description: 'Professional & Corporate', icon: '💼', gradient: 'linear-gradient(135deg,#b8cce4,#4a90d9)', prompt: 'Professional Corporate Office backdrop, blurry high-end tech conference room, bright ambient office windows, depth of field' },
      { id: 'studio',   title: 'Modern Studio',  description: 'Clean & Minimal',         icon: '📷', gradient: 'linear-gradient(135deg,#e8e0f0,#9b59b6)', prompt: 'Clean professional studio backdrop, soft studio lighting, neutral gray background, depth of field' },
      { id: 'academic', title: 'Academic Setting', description: 'Scholarly & Focused',    icon: '🎓', gradient: 'linear-gradient(135deg,#d4a97a,#8b5e3c)', prompt: 'Classic university library background, wooden bookshelves, warm ambient lighting, scholarly atmosphere' },
      { id: 'tech',     title: 'Tech Workspace',  description: 'Innovative & Modern',     icon: '⚡', gradient: 'linear-gradient(135deg,#0a0e27,#1a2a6c)', prompt: 'Futuristic tech office, neon blue lighting, modern monitors, developer workspace background' },
      { id: 'nature',   title: 'Nature Outlook',  description: 'Calming & Refreshing',    icon: '🌿', gradient: 'linear-gradient(135deg,#1a4a1a,#4a8840)', prompt: 'Serene nature background, lush green garden, soft natural lighting, peaceful outdoor setting' },
      // { id: 'pastel',   title: 'Soft Pastel',     description: 'Subtle & Elegant',        icon: '🎨', gradient: 'linear-gradient(135deg,#fde8d8,#f5c6a0)', prompt: 'Minimalist soft pastel background, warm peach tones, clean studio aesthetic, subtle gradient' },
    ];
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  generateBackgrounds(payload: AiGenerateBackgroundRequest): Observable<AiGenerateBackgroundResponse> {
    return this.http.post<AiGenerateBackgroundResponse>(
      `${this.apiUrl}v2/Ai/generate-image-backgrounds`,
      payload
    );
  }

  base64ToFile(base64: string, fileName: string, mimeType: string = 'image/png'): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new File([ab], fileName, { type: mimeType });
  }
}
