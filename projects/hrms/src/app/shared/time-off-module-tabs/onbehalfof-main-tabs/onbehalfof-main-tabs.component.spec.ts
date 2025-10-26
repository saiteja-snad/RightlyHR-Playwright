import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnbehalfofMainTabsComponent } from './onbehalfof-main-tabs.component';

describe('OnbehalfofMainTabsComponent', () => {
  let component: OnbehalfofMainTabsComponent;
  let fixture: ComponentFixture<OnbehalfofMainTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnbehalfofMainTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnbehalfofMainTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
