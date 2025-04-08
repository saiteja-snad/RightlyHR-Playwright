import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPermissionsLayoutComponent } from './roles-permissions-layout.component';

describe('RolesPermissionsLayoutComponent', () => {
  let component: RolesPermissionsLayoutComponent;
  let fixture: ComponentFixture<RolesPermissionsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPermissionsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesPermissionsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
