import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIncrementComponent } from './update-increment.component';

describe('UpdateIncrementComponent', () => {
  let component: UpdateIncrementComponent;
  let fixture: ComponentFixture<UpdateIncrementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateIncrementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateIncrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
