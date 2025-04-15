import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingForApprovalDeskListComponent } from './waiting-for-approval-desk-list.component';

describe('WaitingForApprovalDeskListComponent', () => {
  let component: WaitingForApprovalDeskListComponent;
  let fixture: ComponentFixture<WaitingForApprovalDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingForApprovalDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingForApprovalDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
