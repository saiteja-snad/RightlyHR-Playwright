import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLoaderContentComponent } from './data-loader-content.component';

describe('DataLoaderContentComponent', () => {
  let component: DataLoaderContentComponent;
  let fixture: ComponentFixture<DataLoaderContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataLoaderContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataLoaderContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
