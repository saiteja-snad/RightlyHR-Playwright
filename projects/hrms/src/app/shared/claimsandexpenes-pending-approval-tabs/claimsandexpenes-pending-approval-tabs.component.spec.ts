import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsandexpenesPendingApprovalTabsComponent } from './claimsandexpenes-pending-approval-tabs.component';

describe('ClaimsandexpenesPendingApprovalTabsComponent', () => {
  let component: ClaimsandexpenesPendingApprovalTabsComponent;
  let fixture: ComponentFixture<ClaimsandexpenesPendingApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsandexpenesPendingApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsandexpenesPendingApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
