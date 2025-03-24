import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffWaitingForApprovalComponent } from './comp-off-waiting-for-approval.component';

describe('CompOffWaitingForApprovalComponent', () => {
  let component: CompOffWaitingForApprovalComponent;
  let fixture: ComponentFixture<CompOffWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
