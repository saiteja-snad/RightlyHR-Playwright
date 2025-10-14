import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularAddComponent } from './circular-add.component';

describe('CircularAddComponent', () => {
  let component: CircularAddComponent;
  let fixture: ComponentFixture<CircularAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
