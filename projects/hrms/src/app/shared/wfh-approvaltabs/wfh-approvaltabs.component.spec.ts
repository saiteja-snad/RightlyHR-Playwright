import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhApprovaltabsComponent } from './wfh-approvaltabs.component';

describe('WfhApprovaltabsComponent', () => {
  let component: WfhApprovaltabsComponent;
  let fixture: ComponentFixture<WfhApprovaltabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhApprovaltabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhApprovaltabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
