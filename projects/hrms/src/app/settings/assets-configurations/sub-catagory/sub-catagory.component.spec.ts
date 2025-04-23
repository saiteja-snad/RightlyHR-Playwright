import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCatagoryComponent } from './sub-catagory.component';

describe('SubCatagoryComponent', () => {
  let component: SubCatagoryComponent;
  let fixture: ComponentFixture<SubCatagoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCatagoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCatagoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
