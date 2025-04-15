import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocatedDeskListComponent } from './allocated-desk-list.component';

describe('AllocatedDeskListComponent', () => {
  let component: AllocatedDeskListComponent;
  let fixture: ComponentFixture<AllocatedDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocatedDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocatedDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
