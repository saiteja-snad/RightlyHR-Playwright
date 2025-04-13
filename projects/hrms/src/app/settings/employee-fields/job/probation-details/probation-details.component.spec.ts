import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationDetailsComponent } from './probation-details.component';

describe('ProbationDetailsComponent', () => {
  let component: ProbationDetailsComponent;
  let fixture: ComponentFixture<ProbationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
