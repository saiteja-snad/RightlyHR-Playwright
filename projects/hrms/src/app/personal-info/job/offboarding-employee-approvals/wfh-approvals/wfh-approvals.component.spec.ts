import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhApprovalsComponent } from './wfh-approvals.component';

describe('WfhApprovalsComponent', () => {
  let component: WfhApprovalsComponent;
  let fixture: ComponentFixture<WfhApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
