import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHistoryApprovalsLayoutComponent } from './view-history-approvals-layout.component';

describe('ViewHistoryApprovalsLayoutComponent', () => {
  let component: ViewHistoryApprovalsLayoutComponent;
  let fixture: ComponentFixture<ViewHistoryApprovalsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHistoryApprovalsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHistoryApprovalsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
