import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationForYouRequestComponent } from './separation-for-you-request.component';

describe('SeparationForYouRequestComponent', () => {
  let component: SeparationForYouRequestComponent;
  let fixture: ComponentFixture<SeparationForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
