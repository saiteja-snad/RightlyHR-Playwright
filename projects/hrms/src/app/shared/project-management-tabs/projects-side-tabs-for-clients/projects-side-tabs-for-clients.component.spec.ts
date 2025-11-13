import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsSideTabsForClientsComponent } from './projects-side-tabs-for-clients.component';

describe('ProjectsSideTabsForClientsComponent', () => {
  let component: ProjectsSideTabsForClientsComponent;
  let fixture: ComponentFixture<ProjectsSideTabsForClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsSideTabsForClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsSideTabsForClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
