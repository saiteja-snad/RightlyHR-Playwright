import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncrementComponent } from './add-increment.component';

describe('AddIncrementComponent', () => {
  let component: AddIncrementComponent;
  let fixture: ComponentFixture<AddIncrementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncrementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIncrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
