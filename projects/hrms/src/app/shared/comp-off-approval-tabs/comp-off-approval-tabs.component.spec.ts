import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffApprovalTabsComponent } from './comp-off-approval-tabs.component';

describe('CompOffApprovalTabsComponent', () => {
  let component: CompOffApprovalTabsComponent;
  let fixture: ComponentFixture<CompOffApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
