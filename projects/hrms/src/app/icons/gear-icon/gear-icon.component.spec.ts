import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GearIconComponent } from './gear-icon.component';

describe('GearIconComponent', () => {
  let component: GearIconComponent;
  let fixture: ComponentFixture<GearIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GearIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GearIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
