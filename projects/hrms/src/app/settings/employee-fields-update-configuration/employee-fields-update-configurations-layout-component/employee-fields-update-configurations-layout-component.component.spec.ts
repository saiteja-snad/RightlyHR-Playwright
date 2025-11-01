import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFieldsUpdateConfigurationsLayoutComponentComponent } from './employee-fields-update-configurations-layout-component.component';

describe('EmployeeFieldsUpdateConfigurationsLayoutComponentComponent', () => {
  let component: EmployeeFieldsUpdateConfigurationsLayoutComponentComponent;
  let fixture: ComponentFixture<EmployeeFieldsUpdateConfigurationsLayoutComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFieldsUpdateConfigurationsLayoutComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFieldsUpdateConfigurationsLayoutComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
