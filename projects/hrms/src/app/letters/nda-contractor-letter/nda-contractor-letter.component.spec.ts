import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdaContractorLetterComponent } from './nda-contractor-letter.component';

describe('NdaContractorLetterComponent', () => {
  let component: NdaContractorLetterComponent;
  let fixture: ComponentFixture<NdaContractorLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdaContractorLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdaContractorLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
