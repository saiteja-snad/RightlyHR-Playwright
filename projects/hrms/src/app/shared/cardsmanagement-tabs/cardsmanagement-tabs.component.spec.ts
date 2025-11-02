import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsmanagementTabsComponent } from './cardsmanagement-tabs.component';

describe('CardsmanagementTabsComponent', () => {
  let component: CardsmanagementTabsComponent;
  let fixture: ComponentFixture<CardsmanagementTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsmanagementTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsmanagementTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
