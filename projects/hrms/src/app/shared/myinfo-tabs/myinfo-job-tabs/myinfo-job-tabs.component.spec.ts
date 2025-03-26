import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinfoJobTabsComponent } from './myinfo-job-tabs.component';

describe('MyinfoJobTabsComponent', () => {
  let component: MyinfoJobTabsComponent;
  let fixture: ComponentFixture<MyinfoJobTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinfoJobTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinfoJobTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
