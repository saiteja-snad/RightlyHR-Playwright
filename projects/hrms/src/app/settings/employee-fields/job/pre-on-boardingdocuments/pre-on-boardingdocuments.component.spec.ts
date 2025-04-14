import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOnBoardingdocumentsComponent } from './pre-on-boardingdocuments.component';

describe('PreOnBoardingdocumentsComponent', () => {
  let component: PreOnBoardingdocumentsComponent;
  let fixture: ComponentFixture<PreOnBoardingdocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreOnBoardingdocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreOnBoardingdocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
