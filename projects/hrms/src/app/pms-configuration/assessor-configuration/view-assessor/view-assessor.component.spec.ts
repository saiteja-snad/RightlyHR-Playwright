import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssessorComponent } from './view-assessor.component';

describe('ViewAssessorComponent', () => {
  let component: ViewAssessorComponent;
  let fixture: ComponentFixture<ViewAssessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssessorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
