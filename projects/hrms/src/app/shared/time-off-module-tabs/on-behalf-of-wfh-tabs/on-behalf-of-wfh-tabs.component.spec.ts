import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWfhTabsComponent } from './on-behalf-of-wfh-tabs.component';

describe('OnBehalfOfWfhTabsComponent', () => {
  let component: OnBehalfOfWfhTabsComponent;
  let fixture: ComponentFixture<OnBehalfOfWfhTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWfhTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWfhTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
