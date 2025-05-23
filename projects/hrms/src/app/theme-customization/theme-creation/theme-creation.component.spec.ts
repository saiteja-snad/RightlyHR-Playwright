import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeCreationComponent } from './theme-creation.component';

describe('ThemeCreationComponent', () => {
  let component: ThemeCreationComponent;
  let fixture: ComponentFixture<ThemeCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
