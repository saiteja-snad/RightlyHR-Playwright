import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPerformanceTabsComponent } from './my-performance-tabs.component';

describe('MyPerformanceTabsComponent', () => {
  let component: MyPerformanceTabsComponent;
  let fixture: ComponentFixture<MyPerformanceTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPerformanceTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPerformanceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
