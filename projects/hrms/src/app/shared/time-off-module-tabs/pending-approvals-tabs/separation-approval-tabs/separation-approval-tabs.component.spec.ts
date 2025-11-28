import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationApprovalTabsComponent } from './separation-approval-tabs.component';

describe('SeparationApprovalTabsComponent', () => {
  let component: SeparationApprovalTabsComponent;
  let fixture: ComponentFixture<SeparationApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
