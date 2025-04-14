import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePoliciesTabsComponent } from './manage-policies-tabs.component';

describe('ManagePoliciesTabsComponent', () => {
  let component: ManagePoliciesTabsComponent;
  let fixture: ComponentFixture<ManagePoliciesTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePoliciesTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePoliciesTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
