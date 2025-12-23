import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateCardLayoutComponent } from './rate-card-layout.component';

describe('RateCardLayoutComponent', () => {
  let component: RateCardLayoutComponent;
  let fixture: ComponentFixture<RateCardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateCardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateCardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
