import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeOffBoardingComponent } from './employe-off-boarding.component';

describe('EmployeOffBoardingComponent', () => {
  let component: EmployeOffBoardingComponent;
  let fixture: ComponentFixture<EmployeOffBoardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeOffBoardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeOffBoardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
