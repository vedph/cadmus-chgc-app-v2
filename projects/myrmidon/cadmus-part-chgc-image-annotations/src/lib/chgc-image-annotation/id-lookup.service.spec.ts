import { TestBed } from '@angular/core/testing';

import { IdLookupService } from './id-lookup.service';

describe('IdLookupService', () => {
  let service: IdLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
