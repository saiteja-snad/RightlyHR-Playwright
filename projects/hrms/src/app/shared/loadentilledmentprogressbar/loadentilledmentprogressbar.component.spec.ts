import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadentilledmentprogressbarComponent } from './loadentilledmentprogressbar.component';

describe('LoadentilledmentprogressbarComponent', () => {
  let component: LoadentilledmentprogressbarComponent;
  let fixture: ComponentFixture<LoadentilledmentprogressbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadentilledmentprogressbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadentilledmentprogressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
