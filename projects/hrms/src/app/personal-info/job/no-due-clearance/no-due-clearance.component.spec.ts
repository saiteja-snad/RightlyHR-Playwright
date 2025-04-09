import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDueClearanceComponent } from './no-due-clearance.component';

describe('NoDueClearanceComponent', () => {
  let component: NoDueClearanceComponent;
  let fixture: ComponentFixture<NoDueClearanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDueClearanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDueClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
