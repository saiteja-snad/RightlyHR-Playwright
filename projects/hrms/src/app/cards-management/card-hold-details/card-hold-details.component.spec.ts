import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardHoldDetailsComponent } from './card-hold-details.component';

describe('CardHoldDetailsComponent', () => {
  let component: CardHoldDetailsComponent;
  let fixture: ComponentFixture<CardHoldDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHoldDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardHoldDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
