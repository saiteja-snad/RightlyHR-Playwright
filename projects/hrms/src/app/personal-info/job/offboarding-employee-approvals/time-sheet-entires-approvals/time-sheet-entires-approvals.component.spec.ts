import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetEntiresApprovalsComponent } from './time-sheet-entires-approvals.component';

describe('TimeSheetEntiresApprovalsComponent', () => {
  let component: TimeSheetEntiresApprovalsComponent;
  let fixture: ComponentFixture<TimeSheetEntiresApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSheetEntiresApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSheetEntiresApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
