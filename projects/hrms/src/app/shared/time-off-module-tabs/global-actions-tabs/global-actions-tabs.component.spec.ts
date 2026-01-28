import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalActionsTabsComponent } from './global-actions-tabs.component';

describe('GlobalActionsTabsComponent', () => {
  let component: GlobalActionsTabsComponent;
  let fixture: ComponentFixture<GlobalActionsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalActionsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalActionsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
