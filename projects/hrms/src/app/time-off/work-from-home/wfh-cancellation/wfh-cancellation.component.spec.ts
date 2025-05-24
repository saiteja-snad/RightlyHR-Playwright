import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhCancellationComponent } from './wfh-cancellation.component';

describe('WfhCancellationComponent', () => {
  let component: WfhCancellationComponent;
  let fixture: ComponentFixture<WfhCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhCancellationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
