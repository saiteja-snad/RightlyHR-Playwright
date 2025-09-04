import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationConformitionLetterAcknowledgementComponent } from './probation-conformition-letter-acknowledgement.component';

describe('ProbationConformitionLetterAcknowledgementComponent', () => {
  let component: ProbationConformitionLetterAcknowledgementComponent;
  let fixture: ComponentFixture<ProbationConformitionLetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationConformitionLetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationConformitionLetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
