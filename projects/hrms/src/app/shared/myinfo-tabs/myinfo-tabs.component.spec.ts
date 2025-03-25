import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoTabsComponent } from './myinfo-tabs.component';

describe('MyinfoTabsComponent', () => {
  let component: MyinfoTabsComponent;
  let fixture: ComponentFixture<MyinfoTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
