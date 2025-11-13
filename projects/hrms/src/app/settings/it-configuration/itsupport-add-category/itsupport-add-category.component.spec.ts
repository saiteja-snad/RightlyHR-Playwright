import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsupportAddCategoryComponent } from './itsupport-add-category.component';

describe('ItsupportAddCategoryComponent', () => {
  let component: ItsupportAddCategoryComponent;
  let fixture: ComponentFixture<ItsupportAddCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsupportAddCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsupportAddCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
