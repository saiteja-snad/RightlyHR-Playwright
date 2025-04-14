import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderMaintenanceDeskListComponent } from './under-maintenance-desk-list.component';

describe('UnderMaintenanceDeskListComponent', () => {
  let component: UnderMaintenanceDeskListComponent;
  let fixture: ComponentFixture<UnderMaintenanceDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderMaintenanceDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderMaintenanceDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
