import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationExtensionLetterAcknowledgementComponent } from './probation-extension-letter-acknowledgement.component';

describe('ProbationExtensionLetterAcknowledgementComponent', () => {
  let component: ProbationExtensionLetterAcknowledgementComponent;
  let fixture: ComponentFixture<ProbationExtensionLetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationExtensionLetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationExtensionLetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
