import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicholidaysComponent } from './publicholidays.component';

describe('PublicholidaysComponent', () => {
  let component: PublicholidaysComponent;
  let fixture: ComponentFixture<PublicholidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicholidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicholidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
