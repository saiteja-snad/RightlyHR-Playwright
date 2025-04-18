import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPermissionsComponent } from './global-permissions.component';

describe('GlobalPermissionsComponent', () => {
  let component: GlobalPermissionsComponent;
  let fixture: ComponentFixture<GlobalPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
