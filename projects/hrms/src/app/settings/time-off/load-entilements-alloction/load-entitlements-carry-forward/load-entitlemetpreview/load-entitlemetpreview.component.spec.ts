import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntitlemetpreviewComponent } from './load-entitlemetpreview.component';

describe('LoadEntitlemetpreviewComponent', () => {
  let component: LoadEntitlemetpreviewComponent;
  let fixture: ComponentFixture<LoadEntitlemetpreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntitlemetpreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntitlemetpreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
