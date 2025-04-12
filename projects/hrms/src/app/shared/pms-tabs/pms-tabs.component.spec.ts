import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsTabsComponent } from './pms-tabs.component';

describe('PmsTabsComponent', () => {
  let component: PmsTabsComponent;
  let fixture: ComponentFixture<PmsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
