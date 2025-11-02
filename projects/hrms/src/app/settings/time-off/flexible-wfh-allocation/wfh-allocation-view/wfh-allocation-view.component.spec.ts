import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhAllocationViewComponent } from './wfh-allocation-view.component';

describe('WfhAllocationViewComponent', () => {
  let component: WfhAllocationViewComponent;
  let fixture: ComponentFixture<WfhAllocationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhAllocationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhAllocationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
