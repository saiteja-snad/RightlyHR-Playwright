import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryLayoutComponent } from './document-history-layout.component';

describe('DocumentHistoryLayoutComponent', () => {
  let component: DocumentHistoryLayoutComponent;
  let fixture: ComponentFixture<DocumentHistoryLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
