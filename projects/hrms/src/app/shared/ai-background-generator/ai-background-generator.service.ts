import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { BackgroundTemplate, GeneratedVariation } from './ai-background-generator.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AiBackgroundService {

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

  /**
   * Step 1: Remove background via backend API
   * Replace 'YOUR_API_ENDPOINT/remove-background' with your actual backend URL
   * Expected response: { url: string } or blob
   */
  removeBackground(imageFile: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post('YOUR_API_ENDPOINT/remove-background', formData, { responseType: 'blob' });
  }

  /**
   * Step 2: Generate background variations via backend API
   * Replace 'YOUR_API_ENDPOINT/generate-variations' with your actual backend URL
   * Expected response: { variations: [{ url: string, label: string }] }
   */
  generateVariations(imageFile: File, templateId: string, prompt: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('templateId', templateId);
    formData.append('prompt', prompt);
    return this.http.post('YOUR_API_ENDPOINT/generate-variations', formData);
  }

  /**
   * Converts a blob to object URL for preview
   */
  blobToObjectUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Converts a blob to File for upload
   */
  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type || 'image/png' });
  }
}
