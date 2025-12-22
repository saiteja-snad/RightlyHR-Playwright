import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementProgressbarComponent } from './intial-load-entitlement-progressbar.component';

describe('IntialLoadEntitlementProgressbarComponent', () => {
  let component: IntialLoadEntitlementProgressbarComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementProgressbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementProgressbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
