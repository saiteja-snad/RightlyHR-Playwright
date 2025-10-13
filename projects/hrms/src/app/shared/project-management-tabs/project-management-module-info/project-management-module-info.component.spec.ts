import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementModuleInfoComponent } from './project-management-module-info.component';

describe('ProjectManagementModuleInfoComponent', () => {
  let component: ProjectManagementModuleInfoComponent;
  let fixture: ComponentFixture<ProjectManagementModuleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementModuleInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementModuleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
