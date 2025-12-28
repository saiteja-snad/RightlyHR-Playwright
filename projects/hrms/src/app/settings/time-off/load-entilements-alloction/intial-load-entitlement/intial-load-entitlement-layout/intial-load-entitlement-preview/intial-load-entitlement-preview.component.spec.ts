import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntialLoadEntitlementPreviewComponent } from './intial-load-entitlement-preview.component';

describe('IntialLoadEntitlementPreviewComponent', () => {
  let component: IntialLoadEntitlementPreviewComponent;
  let fixture: ComponentFixture<IntialLoadEntitlementPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntialLoadEntitlementPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntialLoadEntitlementPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
