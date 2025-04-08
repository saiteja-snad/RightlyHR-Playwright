import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAssigneeComponent } from './role-assignee.component';

describe('RoleAssigneeComponent', () => {
  let component: RoleAssigneeComponent;
  let fixture: ComponentFixture<RoleAssigneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAssigneeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
