import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementComponent } from './intial-load-entitlement.component';

describe('IntialLoadEntitlementComponent', () => {
  let component: IntialLoadEntitlementComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
