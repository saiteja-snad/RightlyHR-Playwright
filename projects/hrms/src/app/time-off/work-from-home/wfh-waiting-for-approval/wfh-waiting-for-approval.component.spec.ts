import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhWaitingForApprovalComponent } from './wfh-waiting-for-approval.component';

describe('WfhWaitingForApprovalComponent', () => {
  let component: WfhWaitingForApprovalComponent;
  let fixture: ComponentFixture<WfhWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
