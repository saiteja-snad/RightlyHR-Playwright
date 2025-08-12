import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyInfoDocTabsComponent } from './my-info-doc-tabs.component';

describe('MyInfoDocTabsComponent', () => {
  let component: MyInfoDocTabsComponent;
  let fixture: ComponentFixture<MyInfoDocTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyInfoDocTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyInfoDocTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
