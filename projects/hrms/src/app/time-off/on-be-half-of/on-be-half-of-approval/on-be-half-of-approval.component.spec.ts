import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfApprovalComponent } from './on-be-half-of-approval.component';

describe('OnBeHalfOfApprovalComponent', () => {
  let component: OnBeHalfOfApprovalComponent;
  let fixture: ComponentFixture<OnBeHalfOfApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
