import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhIconComponent } from './wfh-icon.component';

describe('WfhIconComponent', () => {
  let component: WfhIconComponent;
  let fixture: ComponentFixture<WfhIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
