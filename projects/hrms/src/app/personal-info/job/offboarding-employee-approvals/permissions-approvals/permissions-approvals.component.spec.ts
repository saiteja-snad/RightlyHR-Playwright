import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsApprovalsComponent } from './permissions-approvals.component';

describe('PermissionsApprovalsComponent', () => {
  let component: PermissionsApprovalsComponent;
  let fixture: ComponentFixture<PermissionsApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
