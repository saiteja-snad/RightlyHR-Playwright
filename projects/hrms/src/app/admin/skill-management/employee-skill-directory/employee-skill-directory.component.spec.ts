import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSkillDirectoryComponent } from './employee-skill-directory.component';

describe('EmployeeSkillDirectoryComponent', () => {
  let component: EmployeeSkillDirectoryComponent;
  let fixture: ComponentFixture<EmployeeSkillDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSkillDirectoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSkillDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
