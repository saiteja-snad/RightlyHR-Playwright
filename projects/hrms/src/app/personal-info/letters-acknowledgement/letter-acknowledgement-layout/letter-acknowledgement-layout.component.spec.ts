import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterAcknowledgementLayoutComponent } from './letter-acknowledgement-layout.component';

describe('LetterAcknowledgementLayoutComponent', () => {
  let component: LetterAcknowledgementLayoutComponent;
  let fixture: ComponentFixture<LetterAcknowledgementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterAcknowledgementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterAcknowledgementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
