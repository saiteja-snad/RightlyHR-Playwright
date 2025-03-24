import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhRequestTabsComponent } from './wfh-request-tabs.component';

describe('WfhRequestTabsComponent', () => {
  let component: WfhRequestTabsComponent;
  let fixture: ComponentFixture<WfhRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
