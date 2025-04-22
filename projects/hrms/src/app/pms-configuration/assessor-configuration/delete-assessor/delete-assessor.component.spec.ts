import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAssessorComponent } from './delete-assessor.component';

describe('DeleteAssessorComponent', () => {
  let component: DeleteAssessorComponent;
  let fixture: ComponentFixture<DeleteAssessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAssessorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAssessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
