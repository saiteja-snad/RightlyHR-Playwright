import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationConfirmationLetterComponent } from './probation-confirmation-letter.component';

describe('ProbationConfirmationLetterComponent', () => {
  let component: ProbationConfirmationLetterComponent;
  let fixture: ComponentFixture<ProbationConfirmationLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationConfirmationLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationConfirmationLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
