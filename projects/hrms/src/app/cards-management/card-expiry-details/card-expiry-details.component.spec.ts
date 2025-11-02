import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardExpiryDetailsComponent } from './card-expiry-details.component';

describe('CardExpiryDetailsComponent', () => {
  let component: CardExpiryDetailsComponent;
  let fixture: ComponentFixture<CardExpiryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardExpiryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardExpiryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
