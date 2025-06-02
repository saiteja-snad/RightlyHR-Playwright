import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyReportsTabsComponent } from './policy-reports-tabs.component';

describe('PolicyReportsTabsComponent', () => {
  let component: PolicyReportsTabsComponent;
  let fixture: ComponentFixture<PolicyReportsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyReportsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyReportsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
