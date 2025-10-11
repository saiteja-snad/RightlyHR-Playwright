import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveClientsComponent } from './active-clients.component';

describe('ActiveClientsComponent', () => {
  let component: ActiveClientsComponent;
  let fixture: ComponentFixture<ActiveClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
