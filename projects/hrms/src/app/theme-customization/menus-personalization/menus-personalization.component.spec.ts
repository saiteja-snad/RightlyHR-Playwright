import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusPersonalizationComponent } from './menus-personalization.component';

describe('MenusPersonalizationComponent', () => {
  let component: MenusPersonalizationComponent;
  let fixture: ComponentFixture<MenusPersonalizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusPersonalizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusPersonalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
