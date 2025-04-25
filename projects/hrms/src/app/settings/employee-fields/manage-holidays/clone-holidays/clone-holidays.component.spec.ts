import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneHolidaysComponent } from './clone-holidays.component';

describe('CloneHolidaysComponent', () => {
  let component: CloneHolidaysComponent;
  let fixture: ComponentFixture<CloneHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
