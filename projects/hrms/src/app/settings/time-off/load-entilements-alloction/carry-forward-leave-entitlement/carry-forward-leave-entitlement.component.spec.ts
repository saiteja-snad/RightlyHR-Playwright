import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarryForwardLeaveEntitlementComponent } from './carry-forward-leave-entitlement.component';

describe('CarryForwardLeaveEntitlementComponent', () => {
  let component: CarryForwardLeaveEntitlementComponent;
  let fixture: ComponentFixture<CarryForwardLeaveEntitlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarryForwardLeaveEntitlementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarryForwardLeaveEntitlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
