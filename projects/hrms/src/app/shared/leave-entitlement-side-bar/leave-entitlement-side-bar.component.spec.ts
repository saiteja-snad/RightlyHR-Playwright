import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveEntitlementSideBarComponent } from './leave-entitlement-side-bar.component';

describe('LeaveEntitlementSideBarComponent', () => {
  let component: LeaveEntitlementSideBarComponent;
  let fixture: ComponentFixture<LeaveEntitlementSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveEntitlementSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveEntitlementSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
