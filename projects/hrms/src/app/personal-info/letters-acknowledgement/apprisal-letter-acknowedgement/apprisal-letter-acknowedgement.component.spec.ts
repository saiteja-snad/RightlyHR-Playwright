import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprisalLetterAcknowedgementComponent } from './apprisal-letter-acknowedgement.component';

describe('ApprisalLetterAcknowedgementComponent', () => {
  let component: ApprisalLetterAcknowedgementComponent;
  let fixture: ComponentFixture<ApprisalLetterAcknowedgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprisalLetterAcknowedgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprisalLetterAcknowedgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
