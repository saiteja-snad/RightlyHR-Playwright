import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRateCardComponent } from './view-rate-card.component';

describe('ViewRateCardComponent', () => {
  let component: ViewRateCardComponent;
  let fixture: ComponentFixture<ViewRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRateCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
