import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsupportAddSubcategoryComponent } from './itsupport-add-subcategory.component';

describe('ItsupportAddSubcategoryComponent', () => {
  let component: ItsupportAddSubcategoryComponent;
  let fixture: ComponentFixture<ItsupportAddSubcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsupportAddSubcategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsupportAddSubcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
