import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedHolidaysComponent } from './published-holidays.component';

describe('PublishedHolidaysComponent', () => {
  let component: PublishedHolidaysComponent;
  let fixture: ComponentFixture<PublishedHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
