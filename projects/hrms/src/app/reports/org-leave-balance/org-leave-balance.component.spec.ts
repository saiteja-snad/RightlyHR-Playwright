import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgLeaveBalanceComponent } from './org-leave-balance.component';

describe('OrgLeaveBalanceComponent', () => {
  let component: OrgLeaveBalanceComponent;
  let fixture: ComponentFixture<OrgLeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgLeaveBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
