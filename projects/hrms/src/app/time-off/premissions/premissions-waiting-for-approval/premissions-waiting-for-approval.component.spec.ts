import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsWaitingForApprovalComponent } from './premissions-waiting-for-approval.component';

describe('PremissionsWaitingForApprovalComponent', () => {
  let component: PremissionsWaitingForApprovalComponent;
  let fixture: ComponentFixture<PremissionsWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
