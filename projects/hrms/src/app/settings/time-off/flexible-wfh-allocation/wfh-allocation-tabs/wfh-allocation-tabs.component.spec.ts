import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhAllocationTabsComponent } from './wfh-allocation-tabs.component';

describe('WfhAllocationTabsComponent', () => {
  let component: WfhAllocationTabsComponent;
  let fixture: ComponentFixture<WfhAllocationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhAllocationTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhAllocationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
