import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprisalListComponent } from './apprisal-list.component';

describe('ApprisalListComponent', () => {
  let component: ApprisalListComponent;
  let fixture: ComponentFixture<ApprisalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprisalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprisalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
