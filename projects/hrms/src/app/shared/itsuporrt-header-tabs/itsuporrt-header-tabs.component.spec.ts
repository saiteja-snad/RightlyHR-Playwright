import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItsuporrtHeaderTabsComponent } from './itsuporrt-header-tabs.component';

describe('ItsuporrtHeaderTabsComponent', () => {
  let component: ItsuporrtHeaderTabsComponent;
  let fixture: ComponentFixture<ItsuporrtHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItsuporrtHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItsuporrtHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
