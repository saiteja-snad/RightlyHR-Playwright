import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterAcknowledgementComponent } from './letter-acknowledgement.component';

describe('LetterAcknowledgementComponent', () => {
  let component: LetterAcknowledgementComponent;
  let fixture: ComponentFixture<LetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
