import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsApprovalsComponent } from './documents-approvals.component';

describe('DocumentsApprovalsComponent', () => {
  let component: DocumentsApprovalsComponent;
  let fixture: ComponentFixture<DocumentsApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
