import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDeskListComponent } from './all-desk-list.component';

describe('AllDeskListComponent', () => {
  let component: AllDeskListComponent;
  let fixture: ComponentFixture<AllDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
