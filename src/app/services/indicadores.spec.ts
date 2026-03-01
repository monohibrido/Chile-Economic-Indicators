import { TestBed } from '@angular/core/testing';

import { IndicadoresService } from './indicadores';

describe('Indicadores', () => {
  let service: IndicadoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicadoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
