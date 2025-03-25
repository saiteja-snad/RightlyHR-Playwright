import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarAfterDocumentSubmissionComponent } from './progressbar-after-document-submission.component';

describe('ProgressbarAfterDocumentSubmissionComponent', () => {
  let component: ProgressbarAfterDocumentSubmissionComponent;
  let fixture: ComponentFixture<ProgressbarAfterDocumentSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressbarAfterDocumentSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressbarAfterDocumentSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
