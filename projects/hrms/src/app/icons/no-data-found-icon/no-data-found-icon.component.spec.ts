import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataFoundIconComponent } from './no-data-found-icon.component';

describe('NoDataFoundIconComponent', () => {
  let component: NoDataFoundIconComponent;
  let fixture: ComponentFixture<NoDataFoundIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDataFoundIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataFoundIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
