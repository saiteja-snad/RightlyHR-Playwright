import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfApprovalTabsComponent } from './on-be-half-of-approval-tabs.component';

describe('OnBeHalfOfApprovalTabsComponent', () => {
  let component: OnBeHalfOfApprovalTabsComponent;
  let fixture: ComponentFixture<OnBeHalfOfApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
