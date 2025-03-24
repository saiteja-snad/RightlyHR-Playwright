import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesProcessedComponent } from './leaves-processed.component';

describe('LeavesProcessedComponent', () => {
  let component: LeavesProcessedComponent;
  let fixture: ComponentFixture<LeavesProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
