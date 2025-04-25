import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingApprovalsTabsComponent } from './pending-approvals-tabs.component';

describe('PendingApprovalsTabsComponent', () => {
  let component: PendingApprovalsTabsComponent;
  let fixture: ComponentFixture<PendingApprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingApprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingApprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
