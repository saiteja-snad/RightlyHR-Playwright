import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedWeekendsComponent } from './published-weekends.component';

describe('PublishedWeekendsComponent', () => {
  let component: PublishedWeekendsComponent;
  let fixture: ComponentFixture<PublishedWeekendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedWeekendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedWeekendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
