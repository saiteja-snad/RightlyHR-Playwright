import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsSideTabsforPhasesComponent } from './projects-side-tabsfor-phases.component';

describe('ProjectsSideTabsforPhasesComponent', () => {
  let component: ProjectsSideTabsforPhasesComponent;
  let fixture: ComponentFixture<ProjectsSideTabsforPhasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsSideTabsforPhasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsSideTabsforPhasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
