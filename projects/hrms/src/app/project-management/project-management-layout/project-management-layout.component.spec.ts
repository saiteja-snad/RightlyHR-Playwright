import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementLayoutComponent } from './project-management-layout.component';

describe('ProjectManagementLayoutComponent', () => {
  let component: ProjectManagementLayoutComponent;
  let fixture: ComponentFixture<ProjectManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
