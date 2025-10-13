import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveProjectDocumentsComponent } from './inactive-project-documents.component';

describe('InactiveProjectDocumentsComponent', () => {
  let component: InactiveProjectDocumentsComponent;
  let fixture: ComponentFixture<InactiveProjectDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveProjectDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveProjectDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
