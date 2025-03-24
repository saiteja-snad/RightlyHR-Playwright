import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesApprovalComponent } from './leaves-approval.component';

describe('LeavesApprovalComponent', () => {
  let component: LeavesApprovalComponent;
  let fixture: ComponentFixture<LeavesApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
