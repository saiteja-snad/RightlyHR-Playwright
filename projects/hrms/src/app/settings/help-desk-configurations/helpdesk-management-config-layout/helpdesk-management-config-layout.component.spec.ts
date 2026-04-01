import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskManagementConfigLayoutComponent } from './helpdesk-management-config-layout.component';

describe('HelpdeskManagementConfigLayoutComponent', () => {
  let component: HelpdeskManagementConfigLayoutComponent;
  let fixture: ComponentFixture<HelpdeskManagementConfigLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskManagementConfigLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskManagementConfigLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
