import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsCreationComponent } from './documents-creation.component';

describe('DocumentsCreationComponent', () => {
  let component: DocumentsCreationComponent;
  let fixture: ComponentFixture<DocumentsCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
