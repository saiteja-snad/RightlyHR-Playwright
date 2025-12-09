import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewIconComponent } from './document-view-icon.component';

describe('DocumentViewIconComponent', () => {
  let component: DocumentViewIconComponent;
  let fixture: ComponentFixture<DocumentViewIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentViewIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
