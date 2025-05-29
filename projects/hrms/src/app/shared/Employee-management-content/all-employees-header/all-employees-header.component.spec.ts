import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEmployeesHeaderComponent } from './all-employees-header.component';

describe('AllEmployeesHeaderComponent', () => {
  let component: AllEmployeesHeaderComponent;
  let fixture: ComponentFixture<AllEmployeesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllEmployeesHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllEmployeesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
