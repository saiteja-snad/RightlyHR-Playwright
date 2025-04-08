import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFieldsLayoutComponent } from './employee-fields-layout.component';

describe('EmployeeFieldsLayoutComponent', () => {
  let component: EmployeeFieldsLayoutComponent;
  let fixture: ComponentFixture<EmployeeFieldsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFieldsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFieldsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
