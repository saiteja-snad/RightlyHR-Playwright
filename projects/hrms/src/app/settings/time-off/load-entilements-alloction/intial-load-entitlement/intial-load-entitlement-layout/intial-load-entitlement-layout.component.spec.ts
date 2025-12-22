import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementLayoutComponent } from './intial-load-entitlement-layout.component';

describe('IntialLoadEntitlementLayoutComponent', () => {
  let component: IntialLoadEntitlementLayoutComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
