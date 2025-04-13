import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntitlementsComponent } from './load-entitlements.component';

describe('LoadEntitlementsComponent', () => {
  let component: LoadEntitlementsComponent;
  let fixture: ComponentFixture<LoadEntitlementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntitlementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntitlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
