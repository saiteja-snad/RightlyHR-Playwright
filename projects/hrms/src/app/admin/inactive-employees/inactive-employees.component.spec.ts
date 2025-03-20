import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveEmployeesComponent } from './inactive-employees.component';

describe('InactiveEmployeesComponent', () => {
  let component: InactiveEmployeesComponent;
  let fixture: ComponentFixture<InactiveEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
