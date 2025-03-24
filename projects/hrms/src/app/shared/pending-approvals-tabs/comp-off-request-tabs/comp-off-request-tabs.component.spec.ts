import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffRequestTabsComponent } from './comp-off-request-tabs.component';

describe('CompOffRequestTabsComponent', () => {
  let component: CompOffRequestTabsComponent;
  let fixture: ComponentFixture<CompOffRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
