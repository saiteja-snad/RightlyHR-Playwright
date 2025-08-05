import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleryRevisionLetterAcknowedgementComponent } from './salery-revision-letter-acknowedgement.component';

describe('SaleryRevisionLetterAcknowedgementComponent', () => {
  let component: SaleryRevisionLetterAcknowedgementComponent;
  let fixture: ComponentFixture<SaleryRevisionLetterAcknowedgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleryRevisionLetterAcknowedgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleryRevisionLetterAcknowedgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
