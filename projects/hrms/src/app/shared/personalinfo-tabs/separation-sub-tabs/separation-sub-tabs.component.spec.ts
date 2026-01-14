import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationSubTabsComponent } from './separation-sub-tabs.component';

describe('SeparationSubTabsComponent', () => {
  let component: SeparationSubTabsComponent;
  let fixture: ComponentFixture<SeparationSubTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationSubTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationSubTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
