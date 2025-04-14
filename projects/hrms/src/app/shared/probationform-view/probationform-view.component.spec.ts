import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationformViewComponent } from './probationform-view.component';

describe('ProbationformViewComponent', () => {
  let component: ProbationformViewComponent;
  let fixture: ComponentFixture<ProbationformViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationformViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationformViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
