import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsMainTabsComponent } from './reports-main-tabs.component';

describe('ReportsMainTabsComponent', () => {
  let component: ReportsMainTabsComponent;
  let fixture: ComponentFixture<ReportsMainTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsMainTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsMainTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
