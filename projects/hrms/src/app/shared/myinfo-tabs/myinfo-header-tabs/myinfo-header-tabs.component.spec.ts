import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoHeaderTabsComponent } from './myinfo-header-tabs.component';

describe('MyinfoHeaderTabsComponent', () => {
  let component: MyinfoHeaderTabsComponent;
  let fixture: ComponentFixture<MyinfoHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
