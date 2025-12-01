import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDueClearanceInfoComponent } from './no-due-clearance-info.component';

describe('NoDueClearanceInfoComponent', () => {
  let component: NoDueClearanceInfoComponent;
  let fixture: ComponentFixture<NoDueClearanceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDueClearanceInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDueClearanceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
