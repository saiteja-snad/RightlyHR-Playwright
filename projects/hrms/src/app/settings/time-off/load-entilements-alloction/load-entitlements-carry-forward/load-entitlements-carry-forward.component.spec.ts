import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntitlementsCarryForwardComponent } from './load-entitlements-carry-forward.component';

describe('LoadEntitlementsCarryForwardComponent', () => {
  let component: LoadEntitlementsCarryForwardComponent;
  let fixture: ComponentFixture<LoadEntitlementsCarryForwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntitlementsCarryForwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntitlementsCarryForwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
