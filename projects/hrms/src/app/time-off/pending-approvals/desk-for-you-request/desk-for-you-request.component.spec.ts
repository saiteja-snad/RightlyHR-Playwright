import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskForYouRequestComponent } from './desk-for-you-request.component';

describe('DeskForYouRequestComponent', () => {
  let component: DeskForYouRequestComponent;
  let fixture: ComponentFixture<DeskForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
