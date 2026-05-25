import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskHeaderTabsComponent } from './helpdesk-header-tabs.component';

describe('HelpdeskHeaderTabsComponent', () => {
  let component: HelpdeskHeaderTabsComponent;
  let fixture: ComponentFixture<HelpdeskHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
