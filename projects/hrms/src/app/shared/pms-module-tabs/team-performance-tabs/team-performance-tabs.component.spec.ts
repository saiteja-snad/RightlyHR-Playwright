import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPerformanceTabsComponent } from './team-performance-tabs.component';

describe('TeamPerformanceTabsComponent', () => {
  let component: TeamPerformanceTabsComponent;
  let fixture: ComponentFixture<TeamPerformanceTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPerformanceTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamPerformanceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
