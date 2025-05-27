import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDataLayoutComponent } from './employee-data-layout.component';

describe('EmployeeDataLayoutComponent', () => {
  let component: EmployeeDataLayoutComponent;
  let fixture: ComponentFixture<EmployeeDataLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDataLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDataLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
