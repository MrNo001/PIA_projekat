import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreTouristComponent } from './explore-tourist.component';

describe('ExploreTouristComponent', () => {
  let component: ExploreTouristComponent;
  let fixture: ComponentFixture<ExploreTouristComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreTouristComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreTouristComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
