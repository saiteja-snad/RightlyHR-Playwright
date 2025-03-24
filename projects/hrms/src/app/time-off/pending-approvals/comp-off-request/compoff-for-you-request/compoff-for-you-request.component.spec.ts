import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoffForYouRequestComponent } from './compoff-for-you-request.component';

describe('CompoffForYouRequestComponent', () => {
  let component: CompoffForYouRequestComponent;
  let fixture: ComponentFixture<CompoffForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompoffForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompoffForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
