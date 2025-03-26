import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompensationComponent } from './compensation.component';

describe('CompensationComponent', () => {
  let component: CompensationComponent;
  let fixture: ComponentFixture<CompensationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompensationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompensationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
