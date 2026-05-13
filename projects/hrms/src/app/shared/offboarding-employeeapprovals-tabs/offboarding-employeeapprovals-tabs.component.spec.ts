import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffboardingEmployeeapprovalsTabsComponent } from './offboarding-employeeapprovals-tabs.component';

describe('OffboardingEmployeeapprovalsTabsComponent', () => {
  let component: OffboardingEmployeeapprovalsTabsComponent;
  let fixture: ComponentFixture<OffboardingEmployeeapprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffboardingEmployeeapprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffboardingEmployeeapprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
