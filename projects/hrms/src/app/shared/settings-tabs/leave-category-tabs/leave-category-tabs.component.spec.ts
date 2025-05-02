import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCategoryTabsComponent } from './leave-category-tabs.component';

describe('LeaveCategoryTabsComponent', () => {
  let component: LeaveCategoryTabsComponent;
  let fixture: ComponentFixture<LeaveCategoryTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveCategoryTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveCategoryTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
