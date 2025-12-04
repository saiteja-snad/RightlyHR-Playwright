import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntilementsAlloctionComponent } from './load-entilements-alloction.component';

describe('LoadEntilementsAlloctionComponent', () => {
  let component: LoadEntilementsAlloctionComponent;
  let fixture: ComponentFixture<LoadEntilementsAlloctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntilementsAlloctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntilementsAlloctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
