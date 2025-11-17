import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeoffApprovalTabsComponent } from './timeoff-approval-tabs.component';

describe('TimeoffApprovalTabsComponent', () => {
  let component: TimeoffApprovalTabsComponent;
  let fixture: ComponentFixture<TimeoffApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeoffApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeoffApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
