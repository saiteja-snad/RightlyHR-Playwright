import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveClientDocumentsComponent } from './inactive-client-documents.component';

describe('InactiveClientDocumentsComponent', () => {
  let component: InactiveClientDocumentsComponent;
  let fixture: ComponentFixture<InactiveClientDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveClientDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveClientDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
