import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorsRequestTabsComponent } from './contractors-request-tabs.component';

describe('ContractorsRequestTabsComponent', () => {
  let component: ContractorsRequestTabsComponent;
  let fixture: ComponentFixture<ContractorsRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorsRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorsRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
