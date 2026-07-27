import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SetupWizardService } from '../../services/setup-wizard.service';

@Component({
  selector: 'app-setup-module-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup-module-form.component.html',
  styleUrl: './setup-module-form.component.scss'
})
export class SetupModuleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly wizardService = inject(SetupWizardService);

  moduleForm!: FormGroup;
  currentIndex = 0;
  spinnerLoader = false;

  get currentModule() {
    return this.wizardService.modules()[this.currentIndex];
  }

  get isFirst(): boolean {
    return this.currentIndex === 0;
  }

  get isLast(): boolean {
    return this.currentIndex === this.wizardService.modules().length - 1;
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.currentIndex = data['moduleIndex'] ?? 0;
      this.wizardService.setCurrentModule(this.currentIndex);
      this.initForm();
    });
  }

  private initForm(): void {
    this.moduleForm = this.fb.group({
      configName: ['', Validators.required],
      description: [''],
      enableModule: [false]
    });
  }

  onBack(): void {
    if (!this.isFirst) {
      const prevModule = this.wizardService.modules()[this.currentIndex - 1];
      this.router.navigate(['/setup-wizard', prevModule.route]);
    }
  }

  onNext(): void {
    if (this.isLast) {
      this.onFinish();
      return;
    }
    this.wizardService.markModuleComplete(this.currentIndex);
    const nextModule = this.wizardService.modules()[this.currentIndex + 1];
    this.router.navigate(['/setup-wizard', nextModule.route]);
  }

  private onFinish(): void {
    this.spinnerLoader = true;
    this.wizardService.markModuleComplete(this.currentIndex);
    setTimeout(() => {
      this.spinnerLoader = false;
      this.router.navigate(['/setup-wizard/complete']);
    }, 600);
  }
}
