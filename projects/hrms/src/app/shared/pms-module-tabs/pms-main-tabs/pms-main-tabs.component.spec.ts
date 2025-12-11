import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsMainTabsComponent } from './pms-main-tabs.component';

describe('PmsMainTabsComponent', () => {
  let component: PmsMainTabsComponent;
  let fixture: ComponentFixture<PmsMainTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsMainTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmsMainTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
