import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeperationRequestsComponent } from './seperation-requests.component';

describe('SeperationRequestsComponent', () => {
  let component: SeperationRequestsComponent;
  let fixture: ComponentFixture<SeperationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeperationRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeperationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
