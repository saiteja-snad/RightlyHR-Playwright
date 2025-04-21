import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteProcessedComponent } from './remote-processed.component';

describe('RemoteProcessedComponent', () => {
  let component: RemoteProcessedComponent;
  let fixture: ComponentFixture<RemoteProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
