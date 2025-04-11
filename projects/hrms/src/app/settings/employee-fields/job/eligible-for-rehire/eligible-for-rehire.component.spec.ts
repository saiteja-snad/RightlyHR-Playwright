import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibleForRehireComponent } from './eligible-for-rehire.component';

describe('EligibleForRehireComponent', () => {
  let component: EligibleForRehireComponent;
  let fixture: ComponentFixture<EligibleForRehireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibleForRehireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EligibleForRehireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
