import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportReportsTabsComponent } from './it-support-reports-tabs.component';

describe('ItSupportReportsTabsComponent', () => {
  let component: ItSupportReportsTabsComponent;
  let fixture: ComponentFixture<ItSupportReportsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItSupportReportsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItSupportReportsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
