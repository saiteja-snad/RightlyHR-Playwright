import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementConfigLayoutComponent } from './project-management-config-layout.component';

describe('ProjectManagementConfigLayoutComponent', () => {
  let component: ProjectManagementConfigLayoutComponent;
  let fixture: ComponentFixture<ProjectManagementConfigLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementConfigLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementConfigLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
