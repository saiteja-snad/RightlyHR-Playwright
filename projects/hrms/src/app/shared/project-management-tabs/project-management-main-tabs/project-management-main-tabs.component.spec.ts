import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementMainTabsComponent } from './project-management-main-tabs.component';

describe('ProjectManagementMainTabsComponent', () => {
  let component: ProjectManagementMainTabsComponent;
  let fixture: ComponentFixture<ProjectManagementMainTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementMainTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementMainTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
