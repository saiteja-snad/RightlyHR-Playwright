import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFromHomeComponent } from './work-from-home.component';

describe('WorkFromHomeComponent', () => {
  let component: WorkFromHomeComponent;
  let fixture: ComponentFixture<WorkFromHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkFromHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFromHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
