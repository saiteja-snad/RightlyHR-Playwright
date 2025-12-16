import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementExecutionComponent } from './intial-load-entitlement-execution.component';

describe('IntialLoadEntitlementExecutionComponent', () => {
  let component: IntialLoadEntitlementExecutionComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementExecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
