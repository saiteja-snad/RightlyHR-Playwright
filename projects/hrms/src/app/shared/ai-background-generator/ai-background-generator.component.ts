import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AiBackgroundService } from './ai-background-generator.service';
import { BackgroundTemplate, GeneratedVariation } from './ai-background-generator.model';
import { Skeleton } from 'primeng/skeleton';
import { OpenModalService } from '../../services/open-modal.service';
// @ts-ignore
import Cropper from 'cropperjs';
import type CropperType from 'cropperjs';

@Component({
  selector: 'app-ai-background-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    TextareaModule,
    ProgressSpinnerModule,
    ToastModule,
    Skeleton,
  ],
  providers: [MessageService],
  templateUrl: './ai-background-generator.component.html',
  styleUrls: ['./ai-background-generator.component.scss'],
})
export class AiBackgroundGeneratorComponent implements OnInit, OnDestroy {
  @ViewChild('aiModal') aiModal: any;
  @ViewChild('cropperImg') cropperImgRef!: ElementRef<HTMLImageElement>;
  @Output() profileApplied = new EventEmitter<File>();

  private modalRef: NgbModalRef | null = null;
  private cropper: CropperType | null = null;

  form!: FormGroup;
  templates: BackgroundTemplate[] = [];
  variations: GeneratedVariation[] = [];

  uploadedImageUrl: string | null = null;
  uploadedFile: File | null = null;
  uploadedBase64: string | null = null;
  originalImageUrl: string | null = null;
  originalBase64: string | null = null;

  selectedTemplate: BackgroundTemplate | null = null;
  selectedVariation: GeneratedVariation | null = null;
  previewUrl: string | null = null;

  isGenerating = false;
  isApplying = false;
  errorMessage: string | null = null;

  // ── Editor state ──
  showEditor = false;
  editApplied = false;
  editorTab: 'crop' | 'filters' | 'adjust' = 'crop';
  brightness = 100;
  contrast = 100;
  saturation = 100;

  readonly filterPresets = [
    { label: 'Normal',  b: 100, c: 100, s: 100 },
    { label: 'Vivid',   b: 110, c: 115, s: 130 },
    { label: 'B&W',     b: 105, c: 100, s: 0   },
    { label: 'Matte',   b: 108, c: 90,  s: 70  },
    { label: 'Bright',  b: 120, c: 105, s: 110 },
    { label: 'Drama',   b: 90,  c: 130, s: 85  },
  ];

  get generatingLabel(): string {
    return this.isGenerating ? 'Generating...' : 'Generate Background Variations';
  }

  constructor(
    private fb: FormBuilder,
    private aiService: AiBackgroundService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({ prompt: ['', Validators.required] });
    this.templates = this.aiService.getTemplates();
  }

  ngOnDestroy() {
    this.destroyCropper();
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

  async openWithImage(imageUrl: string) {
    this.resetState();
    this.modalRef = this.modalService.open(this.aiModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'ai-bg-modal',
    });
    try {
      const response = await fetch(imageUrl as string);
      const blob = await response.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const file = new File([blob], `profile.${ext}`, { type: blob.type });
      this.uploadedFile = file;
      this.uploadedImageUrl = URL.createObjectURL(file);
      this.previewUrl = this.uploadedImageUrl;
      this.uploadedBase64 = await this.aiService.fileToBase64(file);
      this.originalImageUrl = this.uploadedImageUrl;
      this.originalBase64 = this.uploadedBase64;
      this.openEditor();
    } catch {
      // If the profile URL is a safe/sanitized blob URL, fall back to open normally
    }
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
    // Save original for restore
    if (!this.originalImageUrl) {
      this.originalImageUrl = this.uploadedImageUrl;
      this.originalBase64 = this.uploadedBase64;
    }
    input.value = '';
    this.openEditor();
  }

  // ── Editor ──
  openEditor() {
    this.showEditor = true;
    this.editorTab = 'crop';
    this.brightness = 100;
    this.contrast = 100;
    this.saturation = 100;
    setTimeout(() => this.initCropper(), 50);
  }

  private initCropper() {
    this.destroyCropper();
    const img = this.cropperImgRef?.nativeElement;
    if (!img) return;
    // Use previewUrl so AI-generated variations are editable, not the original upload
    const src = this.previewUrl || this.uploadedImageUrl;
    if (!src) return;
    img.src = src;
    this.cropper = new (Cropper as any)(img, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
      guides: true,
      center: true,
      highlight: false,
      background: false,
    });
  }

  private destroyCropper() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  rotateCropper(deg: number) {
    this.cropper?.rotate(deg);
  }

  zoomCropper(ratio: number) {
    this.cropper?.zoom(ratio);
  }

  resetCropper() {
    this.cropper?.reset();
    this.brightness = 100;
    this.contrast = 100;
    this.saturation = 100;
  }

  applyPreset(preset: { b: number; c: number; s: number }) {
    this.brightness = preset.b;
    this.contrast = preset.c;
    this.saturation = preset.s;
  }

  get filterStyle(): string {
    return `brightness(${this.brightness}%) contrast(${this.contrast}%) saturate(${this.saturation}%)`;
  }

  async applyEditor() {
    if (!this.cropper) return;

    const croppedCanvas = this.cropper.getCroppedCanvas({ width: 1024, height: 1024 });

    const offscreen = document.createElement('canvas');
    offscreen.width = croppedCanvas.width;
    offscreen.height = croppedCanvas.height;
    const ctx = offscreen.getContext('2d')!;
    ctx.filter = this.filterStyle;
    ctx.drawImage(croppedCanvas, 0, 0);

    const dataUrl = offscreen.toDataURL('image/png');
    this.previewUrl = dataUrl;
    this.uploadedImageUrl = dataUrl;
    this.uploadedBase64 = dataUrl.split(',')[1];
    // If editing an AI variation, update its base64 too and clear selection
    if (this.selectedVariation) {
      this.selectedVariation.image_base64 = this.uploadedBase64;
      this.selectedVariation.dataUrl = dataUrl;
    }
    this.editApplied = true;
    this.destroyCropper();
    this.showEditor = false;
  }

  closeEditor() {
    this.destroyCropper();
    this.showEditor = false;
    // If no image was confirmed yet, clear the upload
    if (!this.uploadedBase64) {
      this.uploadedImageUrl = null;
      this.previewUrl = null;
    }
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

    const payload = {
      image_base64: this.uploadedBase64,
      prompt: this.form.value.prompt || this.selectedTemplate?.prompt,
    };

    this.aiService.generateBackgrounds(payload).subscribe({
      next: (res: any) => {
        this.isGenerating = false;
        const items: any[] = Array.isArray(res)
          ? res
          : (res?.data ?? res?.variations ?? []);

        if (!items.length) {
          this.showError(res?.message || 'No backgrounds were generated.');
          return;
        }

        const labels = ['Classic Library', 'Warm Bokeh', 'Studio Neutral'];
        const sublabels = ['Timeless & Elegant', 'Soft & Professional', 'Clean & Modern'];

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

          if (base64) base64 = base64.replace(/\s+/g, '');
          const dataUrl = base64 ? `data:image/png;base64,${base64}` : '';

          return { id, image_base64: base64, dataUrl, label, sublabel: sublabels[i] ?? '', selected: false } as GeneratedVariation;
        });

        const firstValid = this.variations.find(v => !!v.dataUrl) || this.variations[0];
        if (!firstValid?.dataUrl) {
          this.showError(res?.message || 'No valid generated images were returned.');
          return;
        }
        this.selectVariation(firstValid);
      },
      error: (err) => {
        this.isGenerating = false;
        const msg = err?.error?.message || err?.error?.details || 'Failed to generate backgrounds.';
        this.showError(msg);
      },
    });
  }

  selectVariation(variation: GeneratedVariation) {
    this.variations.forEach(v => (v.selected = false));
    variation.selected = true;
    this.selectedVariation = variation;
    this.previewUrl = variation.dataUrl;
  }

  get hasChanges(): boolean {
    return this.editApplied || !!this.selectedVariation;
  }

  get canApply(): boolean {
    return this.editApplied || !!this.selectedVariation;
  }

  restoreOriginal() {
    if (!this.originalImageUrl || !this.originalBase64) return;
    this.previewUrl = this.originalImageUrl;
    this.uploadedImageUrl = this.originalImageUrl;
    this.uploadedBase64 = this.originalBase64;
    this.editApplied = false;
    this.selectedVariation = null;
    this.variations.forEach(v => (v.selected = false));
  }

  applyVariation() {
    if (this.editApplied && !this.selectedVariation) {
      // User only cropped/filtered — apply the edited image directly
      this.isApplying = true;
      const base64 = this.uploadedBase64!;
      const file = this.aiService.base64ToFile(base64, `edited_profile_${Date.now()}.png`);
      this.isApplying = false;
      this.profileApplied.emit(file);
      this.close();
      return;
    }
    if (!this.selectedVariation) return;
    this.isApplying = true;
    const file = this.aiService.base64ToFile(
      this.selectedVariation.image_base64,
      `ai_bg_${Date.now()}.png`,
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
    this.destroyCropper();
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
    this.originalImageUrl = null;
    this.originalBase64 = null;
    this.showEditor = false;
    this.editApplied = false;
    this.form?.reset({ prompt: '' });
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    this.conformationPopup.openErrorModal(msg);
  }
}
