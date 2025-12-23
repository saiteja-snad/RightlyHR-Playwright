import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntitlementCreateComponent } from './load-entitlement-create.component';

describe('LoadEntitlementCreateComponent', () => {
  let component: LoadEntitlementCreateComponent;
  let fixture: ComponentFixture<LoadEntitlementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntitlementCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntitlementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
