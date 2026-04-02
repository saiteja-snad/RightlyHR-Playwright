import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskComponentTabsComponent } from './helpdesk-component-tabs.component';

describe('HelpdeskComponentTabsComponent', () => {
  let component: HelpdeskComponentTabsComponent;
  let fixture: ComponentFixture<HelpdeskComponentTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskComponentTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskComponentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
