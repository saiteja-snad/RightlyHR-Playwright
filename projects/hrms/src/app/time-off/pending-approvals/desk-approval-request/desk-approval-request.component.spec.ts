import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskApprovalRequestComponent } from './desk-approval-request.component';

describe('DeskApprovalRequestComponent', () => {
  let component: DeskApprovalRequestComponent;
  let fixture: ComponentFixture<DeskApprovalRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskApprovalRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskApprovalRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
