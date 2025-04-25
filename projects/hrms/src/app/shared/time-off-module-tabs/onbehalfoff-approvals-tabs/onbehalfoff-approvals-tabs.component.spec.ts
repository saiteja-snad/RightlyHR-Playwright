import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnbehalfoffApprovalsTabsComponent } from './onbehalfoff-approvals-tabs.component';

describe('OnbehalfoffApprovalsTabsComponent', () => {
  let component: OnbehalfoffApprovalsTabsComponent;
  let fixture: ComponentFixture<OnbehalfoffApprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnbehalfoffApprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnbehalfoffApprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
