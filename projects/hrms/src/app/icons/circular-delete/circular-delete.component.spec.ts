import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularDeleteComponent } from './circular-delete.component';

describe('CircularDeleteComponent', () => {
  let component: CircularDeleteComponent;
  let fixture: ComponentFixture<CircularDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
