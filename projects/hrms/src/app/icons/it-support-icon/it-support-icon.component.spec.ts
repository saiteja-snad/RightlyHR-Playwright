import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportIconComponent } from './it-support-icon.component';

describe('ItSupportIconComponent', () => {
  let component: ItSupportIconComponent;
  let fixture: ComponentFixture<ItSupportIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItSupportIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItSupportIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
