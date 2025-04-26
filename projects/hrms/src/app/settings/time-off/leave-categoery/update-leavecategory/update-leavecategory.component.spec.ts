import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLeavecategoryComponent } from './update-leavecategory.component';

describe('UpdateLeavecategoryComponent', () => {
  let component: UpdateLeavecategoryComponent;
  let fixture: ComponentFixture<UpdateLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
