import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundcheckComponent } from './backgroundcheck.component';

describe('BackgroundcheckComponent', () => {
  let component: BackgroundcheckComponent;
  let fixture: ComponentFixture<BackgroundcheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundcheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundcheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
