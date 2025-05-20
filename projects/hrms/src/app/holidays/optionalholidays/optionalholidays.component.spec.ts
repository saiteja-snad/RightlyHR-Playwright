import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalholidaysComponent } from './optionalholidays.component';

describe('OptionalholidaysComponent', () => {
  let component: OptionalholidaysComponent;
  let fixture: ComponentFixture<OptionalholidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionalholidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalholidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
