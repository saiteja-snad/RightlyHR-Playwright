import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeskAlloctionLayoutComponent } from './desk-alloction-layout.component';

describe('DeskAlloctionLayoutComponent', () => {
  let component: DeskAlloctionLayoutComponent;
  let fixture: ComponentFixture<DeskAlloctionLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeskAlloctionLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeskAlloctionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
