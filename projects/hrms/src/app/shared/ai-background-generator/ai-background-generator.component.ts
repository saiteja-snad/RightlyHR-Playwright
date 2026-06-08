import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AiBackgroundService } from './ai-background-generator.service';
import { BackgroundTemplate, GeneratedVariation } from './ai-background-generator.model';

@Component({
  selector: 'app-ai-background-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    TextareaModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './ai-background-generator.component.html',
  styleUrl: './ai-background-generator.component.scss',
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
  selectedTemplate: BackgroundTemplate | null = null;
  selectedVariation: GeneratedVariation | null = null;
  previewUrl: string | null = null;

  isGenerating = false;
  isApplying = false;

  get generatingLabel(): string {
    return this.isGenerating ? 'Generating...' : 'Generate Background Variations';
  }

  constructor(private fb: FormBuilder, private aiService: AiBackgroundService, private modalService: NgbModal) {}

  ngOnInit() {
    this.form = this.fb.group({ prompt: [''] });
    this.templates = this.aiService.getTemplates();
  }

  open() {
    this.modalRef = this.modalService.open(this.aiModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'ai-bg-modal',
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;
      this.uploadedFile = file;
      this.uploadedImageUrl = URL.createObjectURL(file);
      this.previewUrl = this.uploadedImageUrl;
      this.variations = [];
      this.selectedVariation = null;
      input.value = '';
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
    if (!this.uploadedFile) return;
    this.isGenerating = true;
    this.variations = [];
    this.selectedVariation = null;

    const prompt = this.form.get('prompt')?.value || '';

    this.aiService.generateVariations(this.uploadedFile, this.selectedTemplate?.id || '', prompt)
      .subscribe({
        next: (res: any) => {
          const labels = ['1. Classic', '2. Cinematic Bokeh', '3. Studio Soft'];
          this.variations = (res.variations ?? []).map((v: any, i: number) => ({
            id: `v${i + 1}`,
            url: v.url,
            label: labels[i] ?? `Variation ${i + 1}`,
            selected: false,
          }));
          this.isGenerating = false;
          if (this.variations.length) this.selectVariation(this.variations[0]);
        },
        error: () => { this.isGenerating = false; }
      });
  }

  selectVariation(variation: GeneratedVariation) {
    this.variations.forEach(v => v.selected = false);
    variation.selected = true;
    this.selectedVariation = variation;
    this.previewUrl = variation.url;
  }

  applyVariation() {
    if (!this.selectedVariation) return;
    this.isApplying = true;
    fetch(this.selectedVariation.url)
      .then(r => r.blob())
      .then(blob => {
        const file = this.aiService.blobToFile(blob, `ai_bg_${Date.now()}.png`);
        this.isApplying = false;
        this.profileApplied.emit(file);
        this.close();
      })
      .catch(() => { this.isApplying = false; });
  }

  close() {
    this.uploadedImageUrl = null;
    this.uploadedFile = null;
    this.previewUrl = null;
    this.variations = [];
    this.selectedVariation = null;
    this.selectedTemplate = null;
    this.isGenerating = false;
    this.form.reset({ prompt: '' });
    this.modalRef?.close();
    this.modalRef = null;
  }
}
