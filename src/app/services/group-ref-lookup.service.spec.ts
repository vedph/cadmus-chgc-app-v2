import { TestBed } from '@angular/core/testing';

import { GroupRefLookupService } from './group-ref-lookup.service';

describe('GroupRefLookupService', () => {
  let service: GroupRefLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupRefLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
