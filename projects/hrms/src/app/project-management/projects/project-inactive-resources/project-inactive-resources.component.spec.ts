import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInactiveResourcesComponent } from './project-inactive-resources.component';

describe('ProjectInactiveResourcesComponent', () => {
  let component: ProjectInactiveResourcesComponent;
  let fixture: ComponentFixture<ProjectInactiveResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInactiveResourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectInactiveResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
