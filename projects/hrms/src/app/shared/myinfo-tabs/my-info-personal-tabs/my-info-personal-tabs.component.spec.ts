import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyInfoPersonalTabsComponent } from './my-info-personal-tabs.component';

describe('MyInfoPersonalTabsComponent', () => {
  let component: MyInfoPersonalTabsComponent;
  let fixture: ComponentFixture<MyInfoPersonalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyInfoPersonalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyInfoPersonalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
