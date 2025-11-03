import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsManagementLayoutComponent } from './cards-management-layout.component';

describe('CardsManagementLayoutComponent', () => {
  let component: CardsManagementLayoutComponent;
  let fixture: ComponentFixture<CardsManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
