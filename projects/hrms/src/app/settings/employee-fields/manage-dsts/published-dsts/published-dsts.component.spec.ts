import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedDstsComponent } from './published-dsts.component';

describe('PublishedDstsComponent', () => {
  let component: PublishedDstsComponent;
  let fixture: ComponentFixture<PublishedDstsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedDstsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedDstsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
