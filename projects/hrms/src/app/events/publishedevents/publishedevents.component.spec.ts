import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedeventsComponent } from './publishedevents.component';

describe('PublishedeventsComponent', () => {
  let component: PublishedeventsComponent;
  let fixture: ComponentFixture<PublishedeventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedeventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedeventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
