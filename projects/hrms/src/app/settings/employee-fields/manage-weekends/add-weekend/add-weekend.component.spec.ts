import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWeekendComponent } from './add-weekend.component';

describe('AddWeekendComponent', () => {
  let component: AddWeekendComponent;
  let fixture: ComponentFixture<AddWeekendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWeekendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWeekendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
