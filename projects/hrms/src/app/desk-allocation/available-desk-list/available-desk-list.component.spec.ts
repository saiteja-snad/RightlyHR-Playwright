import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableDeskListComponent } from './available-desk-list.component';

describe('AvailableDeskListComponent', () => {
  let component: AvailableDeskListComponent;
  let fixture: ComponentFixture<AvailableDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
