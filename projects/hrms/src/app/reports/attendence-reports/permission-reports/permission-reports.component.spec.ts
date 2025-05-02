import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionReportsComponent } from './permission-reports.component';

describe('PermissionReportsComponent', () => {
  let component: PermissionReportsComponent;
  let fixture: ComponentFixture<PermissionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
