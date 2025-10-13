import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProgressBarComponent } from './client-progress-bar.component';

describe('ClientProgressBarComponent', () => {
  let component: ClientProgressBarComponent;
  let fixture: ComponentFixture<ClientProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
