import { TestBed } from '@angular/core/testing';

import { VikendicaService } from './vikendica.service';

describe('VikendicaService', () => {
  let service: VikendicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VikendicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
