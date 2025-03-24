import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsTabsComponent } from './premissions-tabs.component';

describe('PremissionsTabsComponent', () => {
  let component: PremissionsTabsComponent;
  let fixture: ComponentFixture<PremissionsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
