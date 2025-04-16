import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchLocationWiseDataComponent } from './branch-location-wise-data.component';

describe('BranchLocationWiseDataComponent', () => {
  let component: BranchLocationWiseDataComponent;
  let fixture: ComponentFixture<BranchLocationWiseDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchLocationWiseDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchLocationWiseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
