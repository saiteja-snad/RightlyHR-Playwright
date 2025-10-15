import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryNdaLetterComponent } from './document-history-nda-letter.component';

describe('DocumentHistoryNdaLetterComponent', () => {
  let component: DocumentHistoryNdaLetterComponent;
  let fixture: ComponentFixture<DocumentHistoryNdaLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryNdaLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryNdaLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
