import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateCardInactiveComponent } from './rate-card-inactive.component';

describe('RateCardInactiveComponent', () => {
  let component: RateCardInactiveComponent;
  let fixture: ComponentFixture<RateCardInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateCardInactiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateCardInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
