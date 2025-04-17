import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffEntitlementComponent } from './comp-off-entitlement.component';

describe('CompOffEntitlementComponent', () => {
  let component: CompOffEntitlementComponent;
  let fixture: ComponentFixture<CompOffEntitlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffEntitlementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffEntitlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
