import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationFrequencyComponent } from './probation-frequency.component';

describe('ProbationFrequencyComponent', () => {
  let component: ProbationFrequencyComponent;
  let fixture: ComponentFixture<ProbationFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationFrequencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
