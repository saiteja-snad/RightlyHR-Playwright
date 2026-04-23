import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffboardingReportessapprovalsTabsComponent } from './offboarding-reportessapprovals-tabs.component';

describe('OffboardingReportessapprovalsTabsComponent', () => {
  let component: OffboardingReportessapprovalsTabsComponent;
  let fixture: ComponentFixture<OffboardingReportessapprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffboardingReportessapprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffboardingReportessapprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
