import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhAllocationComponent } from './wfh-allocation.component';

describe('WfhAllocationComponent', () => {
  let component: WfhAllocationComponent;
  let fixture: ComponentFixture<WfhAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
