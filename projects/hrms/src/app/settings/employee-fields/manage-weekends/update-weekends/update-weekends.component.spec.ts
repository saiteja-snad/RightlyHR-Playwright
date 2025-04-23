import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateWeekendsComponent } from './update-weekends.component';

describe('UpdateWeekendsComponent', () => {
  let component: UpdateWeekendsComponent;
  let fixture: ComponentFixture<UpdateWeekendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateWeekendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateWeekendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
