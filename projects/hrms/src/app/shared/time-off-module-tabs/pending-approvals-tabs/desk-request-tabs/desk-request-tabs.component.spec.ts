import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskRequestTabsComponent } from './desk-request-tabs.component';

describe('DeskRequestTabsComponent', () => {
  let component: DeskRequestTabsComponent;
  let fixture: ComponentFixture<DeskRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
