import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetApprovalsComponent } from './time-sheet-approvals.component';

describe('TimeSheetApprovalsComponent', () => {
  let component: TimeSheetApprovalsComponent;
  let fixture: ComponentFixture<TimeSheetApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSheetApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSheetApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
