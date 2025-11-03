import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsHistoryComponent } from './cards-history.component';

describe('CardsHistoryComponent', () => {
  let component: CardsHistoryComponent;
  let fixture: ComponentFixture<CardsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
