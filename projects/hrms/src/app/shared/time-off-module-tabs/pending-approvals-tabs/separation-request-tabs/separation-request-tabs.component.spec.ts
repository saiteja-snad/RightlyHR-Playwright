import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationRequestTabsComponent } from './separation-request-tabs.component';

describe('SeparationRequestTabsComponent', () => {
  let component: SeparationRequestTabsComponent;
  let fixture: ComponentFixture<SeparationRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
