import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportApprovalTabsComponent } from './it-support-approval-tabs.component';

describe('ItSupportApprovalTabsComponent', () => {
  let component: ItSupportApprovalTabsComponent;
  let fixture: ComponentFixture<ItSupportApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItSupportApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItSupportApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
