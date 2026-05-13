import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskManagementConfigTabsComponent } from './helpdesk-management-config-tabs.component';

describe('HelpdeskManagementConfigTabsComponent', () => {
  let component: HelpdeskManagementConfigTabsComponent;
  let fixture: ComponentFixture<HelpdeskManagementConfigTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskManagementConfigTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskManagementConfigTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
