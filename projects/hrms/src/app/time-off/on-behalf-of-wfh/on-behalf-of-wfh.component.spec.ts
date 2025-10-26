import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWfhComponent } from './on-behalf-of-wfh.component';

describe('OnBehalfOfWfhComponent', () => {
  let component: OnBehalfOfWfhComponent;
  let fixture: ComponentFixture<OnBehalfOfWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWfhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
