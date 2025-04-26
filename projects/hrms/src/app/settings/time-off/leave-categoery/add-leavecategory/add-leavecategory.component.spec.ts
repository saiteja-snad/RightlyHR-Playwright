import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLeavecategoryComponent } from './add-leavecategory.component';

describe('AddLeavecategoryComponent', () => {
  let component: AddLeavecategoryComponent;
  let fixture: ComponentFixture<AddLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
