import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFieldUpdateConfigComponent } from './document-field-update-config.component';

describe('DocumentFieldUpdateConfigComponent', () => {
  let component: DocumentFieldUpdateConfigComponent;
  let fixture: ComponentFixture<DocumentFieldUpdateConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFieldUpdateConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFieldUpdateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
