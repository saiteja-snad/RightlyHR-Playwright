import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectiveEmployeesComponent } from './prospective-employees.component';

describe('ProspectiveEmployeesComponent', () => {
  let component: ProspectiveEmployeesComponent;
  let fixture: ComponentFixture<ProspectiveEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectiveEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectiveEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
