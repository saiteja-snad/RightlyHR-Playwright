import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementCreateComponent } from './intial-load-entitlement-create.component';

describe('IntialLoadEntitlementCreateComponent', () => {
  let component: IntialLoadEntitlementCreateComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
