import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IntialLoadEntitlementBreakdownComponent } from './intial-load-entitlement-breakdown.component';

describe('IntialLoadEntitlementBreakdownComponent', () => {
  let component: IntialLoadEntitlementBreakdownComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementBreakdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
