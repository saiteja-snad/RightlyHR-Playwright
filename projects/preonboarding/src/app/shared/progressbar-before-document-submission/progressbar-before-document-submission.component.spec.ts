import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarBeforeDocumentSubmissionComponent } from './progressbar-before-document-submission.component';

describe('ProgressbarBeforeDocumentSubmissionComponent', () => {
  let component: ProgressbarBeforeDocumentSubmissionComponent;
  let fixture: ComponentFixture<ProgressbarBeforeDocumentSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressbarBeforeDocumentSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressbarBeforeDocumentSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
