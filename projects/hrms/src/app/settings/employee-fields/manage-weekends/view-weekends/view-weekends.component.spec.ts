import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWeekendsComponent } from './view-weekends.component';

describe('ViewWeekendsComponent', () => {
  let component: ViewWeekendsComponent;
  let fixture: ComponentFixture<ViewWeekendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWeekendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewWeekendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
