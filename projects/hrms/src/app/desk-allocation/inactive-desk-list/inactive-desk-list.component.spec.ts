import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveDeskListComponent } from './inactive-desk-list.component';

describe('InactiveDeskListComponent', () => {
  let component: InactiveDeskListComponent;
  let fixture: ComponentFixture<InactiveDeskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveDeskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveDeskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
