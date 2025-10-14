import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementConfigTabsComponent } from './project-management-config-tabs.component';

describe('ProjectManagementConfigTabsComponent', () => {
  let component: ProjectManagementConfigTabsComponent;
  let fixture: ComponentFixture<ProjectManagementConfigTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementConfigTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementConfigTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
