import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VikendicaComponent } from './vikendica.component';

describe('VikendicaComponent', () => {
  let component: VikendicaComponent;
  let fixture: ComponentFixture<VikendicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VikendicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VikendicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
