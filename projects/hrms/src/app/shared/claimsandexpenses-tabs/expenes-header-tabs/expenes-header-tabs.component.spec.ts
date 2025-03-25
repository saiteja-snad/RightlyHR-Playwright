import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenesHeaderTabsComponent } from './expenes-header-tabs.component';

describe('ExpenesHeaderTabsComponent', () => {
  let component: ExpenesHeaderTabsComponent;
  let fixture: ComponentFixture<ExpenesHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenesHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenesHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
