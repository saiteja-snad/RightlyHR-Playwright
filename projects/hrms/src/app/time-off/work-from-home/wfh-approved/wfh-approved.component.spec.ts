import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhApprovedComponent } from './wfh-approved.component';

describe('WfhApprovedComponent', () => {
  let component: WfhApprovedComponent;
  let fixture: ComponentFixture<WfhApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
