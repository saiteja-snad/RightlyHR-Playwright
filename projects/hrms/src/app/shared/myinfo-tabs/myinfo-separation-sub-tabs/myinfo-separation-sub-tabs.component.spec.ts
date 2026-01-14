import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoSeparationSubTabsComponent } from './myinfo-separation-sub-tabs.component';

describe('MyinfoSeparationSubTabsComponent', () => {
  let component: MyinfoSeparationSubTabsComponent;
  let fixture: ComponentFixture<MyinfoSeparationSubTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoSeparationSubTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoSeparationSubTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
