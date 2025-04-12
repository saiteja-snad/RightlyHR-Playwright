import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShitsComponent } from './shits.component';

describe('ShitsComponent', () => {
  let component: ShitsComponent;
  let fixture: ComponentFixture<ShitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
