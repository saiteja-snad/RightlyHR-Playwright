import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyInfoTeamNumbersTabComponent } from './my-info-team-numbers-tab.component';

describe('MyInfoTeamNumbersTabComponent', () => {
  let component: MyInfoTeamNumbersTabComponent;
  let fixture: ComponentFixture<MyInfoTeamNumbersTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyInfoTeamNumbersTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyInfoTeamNumbersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
