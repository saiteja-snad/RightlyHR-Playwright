import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedLeavecategoryComponent } from './published-leavecategory.component';

describe('PublishedLeavecategoryComponent', () => {
  let component: PublishedLeavecategoryComponent;
  let fixture: ComponentFixture<PublishedLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
