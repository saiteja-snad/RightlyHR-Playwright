import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AiBackgroundService } from './ai-background-generator.service';
import { BackgroundTemplate, GeneratedVariation } from './ai-background-generator.model';
import { Skeleton } from 'primeng/skeleton';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-ai-background-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    TextareaModule,
    ProgressSpinnerModule,
    ToastModule,
    Skeleton
  ],
  providers: [MessageService],
  templateUrl: './ai-background-generator.component.html',
  styleUrls: ['./ai-background-generator.component.scss'],
})
export class AiBackgroundGeneratorComponent implements OnInit {
  @ViewChild('aiModal') aiModal: any;
  @Output() profileApplied = new EventEmitter<File>();

  private modalRef: NgbModalRef | null = null;

  form!: FormGroup;
  templates: BackgroundTemplate[] = [];
  variations: GeneratedVariation[] = [];

  uploadedImageUrl: string | null = null;
  uploadedFile: File | null = null;
  uploadedBase64: string | null = null;

  selectedTemplate: BackgroundTemplate | null = null;
  selectedVariation: GeneratedVariation | null = null;
  previewUrl: string | null = null;

  isGenerating = false;
  isApplying = false;
  errorMessage: string | null = null;

  get generatingLabel(): string {
    return this.isGenerating ? 'Generating...' : 'Generate Background Variations';
  }

  constructor(
    private fb: FormBuilder,
    private aiService: AiBackgroundService,
    private modalService: NgbModal,
     private conformationPopup: OpenModalService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({ prompt: ['',Validators.required] });
    this.templates = this.aiService.getTemplates();
  }

  open() {
    this.resetState();
    this.modalRef = this.modalService.open(this.aiModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'ai-bg-modal',
    });
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      this.showError('Only PNG and JPG images are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image must be smaller than 5MB.');
      return;
    }
    this.uploadedFile = file;
    this.uploadedImageUrl = URL.createObjectURL(file);
    this.previewUrl = this.uploadedImageUrl;
    this.variations = [];
    this.selectedVariation = null;
    this.errorMessage = null;
    this.uploadedBase64 = await this.aiService.fileToBase64(file);
    input.value = '';
  }

  selectTemplate(template: BackgroundTemplate) {
    this.selectedTemplate = template;
    this.form.patchValue({ prompt: template.prompt });
  }

  resetPrompt() {
    this.form.patchValue({ prompt: this.selectedTemplate?.prompt || '' });
  }

  generate() {
    if (!this.uploadedBase64) return;
    this.isGenerating = true;
    this.errorMessage = null;
    this.variations = [];
    this.selectedVariation = null;
    this.previewUrl = this.uploadedImageUrl;

    // Send only image_base64 — confirmed field name with backend
    const payload = { 
      image_base64: this.uploadedBase64,
      prompt: this.form.value.prompt || this.selectedTemplate?.prompt,
    };

    this.aiService.generateBackgrounds(payload).subscribe({
      next: (res: any) => {
        this.isGenerating = false;

        // Handle multiple response shapes:
        // - Plain array response: ["base64", ...]
        // - { data: [...] }
        // - { variations: [...] }
        const items: any[] = Array.isArray(res)
          ? res
          : (res?.data ?? res?.variations ?? []);

        if (!items.length) {
          this.showError(res?.message || 'No backgrounds were generated.');
          return;
        }

        const labels = ['1. Classic', '2. Cinematic Bokeh', '3. Studio Soft'];

        // Support multiple backend shapes:
        // - Array of base64 strings: ["iVBOR...", ...]
        // - Array of objects: [{ id, image_base64 }, ...]
        this.variations = items.map((item: any, i: number) => {
          let base64 = '';
          let id = `v${i + 1}`;
          let label = labels[i] ?? `Variation ${i + 1}`;

          if (typeof item === 'string') {
            base64 = item;
          } else if (item && typeof item === 'object') {
            base64 = item.image_base64 ?? item.imageBase64 ?? item.base64 ?? '';
            id = item.id ?? id;
            label = item.label ?? label;
          }

          // Remove any whitespace/newlines that may be present in the returned base64
          if (base64) {
            base64 = base64.replace(/\s+/g, '');
          }

          const dataUrl = base64 ? `data:image/png;base64,${base64}` : '';

          return {
            id,
            image_base64: base64,
            dataUrl,
            label,
            selected: false,
          } as GeneratedVariation;
        });

        // Select first valid variation (skip empty dataUrls)
        const firstValid = this.variations.find(v => !!v.dataUrl) || this.variations[0];
        if (!firstValid || !firstValid.dataUrl) {
          this.showError(res?.message || 'No valid generated images were returned.');
          return;
        }

        this.selectVariation(firstValid);
      },
      error: (err) => {
        this.isGenerating = false;
        const msg = err?.error?.message || err?.error?.details || 'Failed to generate backgrounds.';
        this.showError(msg);
            this
      },
    });
  }

  selectVariation(variation: GeneratedVariation) {
    this.variations.forEach(v => (v.selected = false));
    variation.selected = true;
    this.selectedVariation = variation;
    this.previewUrl = variation.dataUrl;
  }

  applyVariation() {
    if (!this.selectedVariation) return;
    this.isApplying = true;
    const file = this.aiService.base64ToFile(
      this.selectedVariation.image_base64,
      `ai_bg_${Date.now()}.png`
    );
    this.isApplying = false;
    this.profileApplied.emit(file);
    this.close();
  }

  downloadVariation() {
    if (!this.selectedVariation) return;
    const a = document.createElement('a');
    a.href = this.selectedVariation.dataUrl;
    a.download = `ai_background_${Date.now()}.png`;
    a.click();
  }

  close() {
    this.resetState();
    this.modalRef?.close();
    this.modalRef = null;
  }

  private resetState() {
    this.uploadedImageUrl = null;
    this.uploadedFile = null;
    this.uploadedBase64 = null;
    this.previewUrl = null;
    this.variations = [];
    this.selectedVariation = null;
    this.selectedTemplate = null;
    this.isGenerating = false;
    this.isApplying = false;
    this.errorMessage = null;
    this.form?.reset({ prompt: '' });
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    this.conformationPopup.openErrorModal(msg)
  }
}
