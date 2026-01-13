import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalWfhComponent } from './global-wfh.component';

describe('GlobalWfhComponent', () => {
  let component: GlobalWfhComponent;
  let fixture: ComponentFixture<GlobalWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalWfhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
