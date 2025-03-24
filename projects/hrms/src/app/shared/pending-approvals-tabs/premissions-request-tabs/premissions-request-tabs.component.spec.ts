import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsRequestTabsComponent } from './premissions-request-tabs.component';

describe('PremissionsRequestTabsComponent', () => {
  let component: PremissionsRequestTabsComponent;
  let fixture: ComponentFixture<PremissionsRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionsRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionsRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
