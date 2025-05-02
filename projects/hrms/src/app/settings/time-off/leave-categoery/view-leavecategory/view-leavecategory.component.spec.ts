import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeavecategoryComponent } from './view-leavecategory.component';

describe('ViewLeavecategoryComponent', () => {
  let component: ViewLeavecategoryComponent;
  let fixture: ComponentFixture<ViewLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
