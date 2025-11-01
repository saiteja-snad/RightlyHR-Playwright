import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAllocatedDetailsComponent } from './card-allocated-details.component';

describe('CardAllocatedDetailsComponent', () => {
  let component: CardAllocatedDetailsComponent;
  let fixture: ComponentFixture<CardAllocatedDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAllocatedDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardAllocatedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
