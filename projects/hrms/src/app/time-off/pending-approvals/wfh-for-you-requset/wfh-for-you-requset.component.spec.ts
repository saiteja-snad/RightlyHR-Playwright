import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhForYouRequsetComponent } from './wfh-for-you-requset.component';

describe('WfhForYouRequsetComponent', () => {
  let component: WfhForYouRequsetComponent;
  let fixture: ComponentFixture<WfhForYouRequsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhForYouRequsetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhForYouRequsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
