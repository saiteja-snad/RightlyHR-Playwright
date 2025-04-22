import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIncrementComponent } from './view-increment.component';

describe('ViewIncrementComponent', () => {
  let component: ViewIncrementComponent;
  let fixture: ComponentFixture<ViewIncrementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIncrementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIncrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
