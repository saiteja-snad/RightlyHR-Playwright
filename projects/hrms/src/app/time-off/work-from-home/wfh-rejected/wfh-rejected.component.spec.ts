import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhRejectedComponent } from './wfh-rejected.component';

describe('WfhRejectedComponent', () => {
  let component: WfhRejectedComponent;
  let fixture: ComponentFixture<WfhRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
