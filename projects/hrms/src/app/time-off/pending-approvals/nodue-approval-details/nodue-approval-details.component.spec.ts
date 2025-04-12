import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodueApprovalDetailsComponent } from './nodue-approval-details.component';

describe('NodueApprovalDetailsComponent', () => {
  let component: NodueApprovalDetailsComponent;
  let fixture: ComponentFixture<NodueApprovalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodueApprovalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodueApprovalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
