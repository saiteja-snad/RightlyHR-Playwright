import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategeoryComponent } from './subcategeory.component';

describe('SubcategeoryComponent', () => {
  let component: SubcategeoryComponent;
  let fixture: ComponentFixture<SubcategeoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategeoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcategeoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
