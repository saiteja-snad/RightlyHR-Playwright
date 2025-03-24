import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhProcessedComponent } from './wfh-processed.component';

describe('WfhProcessedComponent', () => {
  let component: WfhProcessedComponent;
  let fixture: ComponentFixture<WfhProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
