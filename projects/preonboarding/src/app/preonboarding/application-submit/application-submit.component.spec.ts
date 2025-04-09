import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSubmitComponent } from './application-submit.component';

describe('ApplicationSubmitComponent', () => {
  let component: ApplicationSubmitComponent;
  let fixture: ComponentFixture<ApplicationSubmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationSubmitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
