import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressProofLetterComponent } from './address-proof-letter.component';

describe('AddressProofLetterComponent', () => {
  let component: AddressProofLetterComponent;
  let fixture: ComponentFixture<AddressProofLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressProofLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressProofLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
