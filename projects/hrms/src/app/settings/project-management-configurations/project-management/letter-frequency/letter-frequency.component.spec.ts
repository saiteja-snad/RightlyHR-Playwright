import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterFrequencyComponent } from './letter-frequency.component';

describe('LetterFrequencyComponent', () => {
  let component: LetterFrequencyComponent;
  let fixture: ComponentFixture<LetterFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterFrequencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
