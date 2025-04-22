import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsManagmentComponent } from './assets-managment.component';

describe('AssetsManagmentComponent', () => {
  let component: AssetsManagmentComponent;
  let fixture: ComponentFixture<AssetsManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
