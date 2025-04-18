import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalPermissionsComponent } from './add-global-permissions.component';

describe('AddGlobalPermissionsComponent', () => {
  let component: AddGlobalPermissionsComponent;
  let fixture: ComponentFixture<AddGlobalPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGlobalPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGlobalPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
