import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneWeekendsComponent } from './clone-weekends.component';

describe('CloneWeekendsComponent', () => {
  let component: CloneWeekendsComponent;
  let fixture: ComponentFixture<CloneWeekendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneWeekendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneWeekendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
