import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorApprovalTabsComponent } from './contractor-approval-tabs.component';

describe('ContractorApprovalTabsComponent', () => {
  let component: ContractorApprovalTabsComponent;
  let fixture: ComponentFixture<ContractorApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
