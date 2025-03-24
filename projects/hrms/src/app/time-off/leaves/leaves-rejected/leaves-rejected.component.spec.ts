import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesRejectedComponent } from './leaves-rejected.component';

describe('LeavesRejectedComponent', () => {
  let component: LeavesRejectedComponent;
  let fixture: ComponentFixture<LeavesRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
