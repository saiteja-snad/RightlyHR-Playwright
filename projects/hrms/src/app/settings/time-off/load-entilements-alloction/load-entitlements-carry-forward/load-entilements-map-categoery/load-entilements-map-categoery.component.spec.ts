import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadEntilementsMapCategoeryComponent } from './load-entilements-map-categoery.component';

describe('LoadEntilementsMapCategoeryComponent', () => {
  let component: LoadEntilementsMapCategoeryComponent;
  let fixture: ComponentFixture<LoadEntilementsMapCategoeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadEntilementsMapCategoeryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadEntilementsMapCategoeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
