import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationTabsComponent } from './regularization-tabs.component';

describe('RegularizationTabsComponent', () => {
  let component: RegularizationTabsComponent;
  let fixture: ComponentFixture<RegularizationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
