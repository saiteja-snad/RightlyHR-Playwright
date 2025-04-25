import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDstTabsComponent } from './manage-dst-tabs.component';

describe('ManageDstTabsComponent', () => {
  let component: ManageDstTabsComponent;
  let fixture: ComponentFixture<ManageDstTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDstTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDstTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
