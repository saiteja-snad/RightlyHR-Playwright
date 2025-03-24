import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesApprovaltabsComponent } from './leaves-approvaltabs.component';

describe('LeavesApprovaltabsComponent', () => {
  let component: LeavesApprovaltabsComponent;
  let fixture: ComponentFixture<LeavesApprovaltabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesApprovaltabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesApprovaltabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
