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
      { id: 'office',   title: 'Office Pro',    description: 'Executive modern setup',  icon: '💼', gradient: 'linear-gradient(135deg,#b8cce4,#4a90d9)', prompt: 'Professional Corporate Office backdrop, blurry high-end tech conference room, bright ambient office windows, depth of field' },
      { id: 'studio',   title: 'Studio Focus',  description: 'Elegant studio lights',   icon: '📷', gradient: 'linear-gradient(135deg,#e8e0f0,#9b59b6)', prompt: 'Clean professional studio backdrop, soft studio lighting, neutral gray background, depth of field' },
      { id: 'academic', title: 'Academic',       description: 'Classy library wood',     icon: '📊', gradient: 'linear-gradient(135deg,#d4a97a,#8b5e3c)', prompt: 'Classic university library background, wooden bookshelves, warm ambient lighting, scholarly atmosphere' },
      { id: 'tech',     title: 'Tech Cyber',     description: 'Clean developer neon',    icon: '⚡', gradient: 'linear-gradient(135deg,#0a0e27,#1a2a6c)', prompt: 'Futuristic tech office, neon blue lighting, modern monitors, developer workspace background' },
      { id: 'nature',   title: 'Nature Zen',     description: 'Calming green glow',      icon: '🌿', gradient: 'linear-gradient(135deg,#1a4a1a,#4a8840)', prompt: 'Serene nature background, lush green garden, soft natural lighting, peaceful outdoor setting' },
      { id: 'clay',     title: 'Clean Clay',     description: 'Soft professional clay',  icon: '🌸', gradient: 'linear-gradient(135deg,#f8c8d8,#e898b8)', prompt: 'Minimalist pastel clay background, soft professional gradient, clean studio aesthetic' },
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
