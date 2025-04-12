import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShitsComponent } from './add-shits.component';

describe('AddShitsComponent', () => {
  let component: AddShitsComponent;
  let fixture: ComponentFixture<AddShitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddShitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
