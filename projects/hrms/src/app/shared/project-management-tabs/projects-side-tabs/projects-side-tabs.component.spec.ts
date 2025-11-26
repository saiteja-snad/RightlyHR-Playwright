import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsSideTabsComponent } from './projects-side-tabs.component';

describe('ProjectsSideTabsComponent', () => {
  let component: ProjectsSideTabsComponent;
  let fixture: ComponentFixture<ProjectsSideTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsSideTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsSideTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
