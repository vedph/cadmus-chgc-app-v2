import { firstValueFrom } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { IdLookupService } from './id-lookup.service';

const ENTRIES: ThesaurusEntry[] = [
  { id: 'Alpha', value: 'Alpha' },
  { id: 'alphabet', value: 'alphabet' },
  { id: 'Beta', value: 'Beta' },
];

describe('IdLookupService', () => {
  let service: IdLookupService;

  beforeEach(() => {
    service = new IdLookupService();
  });

  it('should have an ID', () => {
    expect(service.id).toBe('chgc-ids');
  });

  it('should return nothing for an empty filter', async () => {
    service.entries = ENTRIES;
    expect(
      await firstValueFrom(service.lookup({ text: '  ', limit: 10 })),
    ).toEqual([]);
    expect(
      await firstValueFrom(service.lookup({ text: undefined, limit: 10 })),
    ).toEqual([]);
  });

  it('should match case-insensitively', async () => {
    service.entries = ENTRIES;
    const matches = await firstValueFrom(
      service.lookup({ text: 'ALPH', limit: 10 }),
    );
    expect(matches.map((e) => e.id)).toEqual(['Alpha', 'alphabet']);
  });

  it('should honor the limit', async () => {
    service.entries = ENTRIES;
    const matches = await firstValueFrom(
      service.lookup({ text: 'a', limit: 1 }),
    );
    expect(matches.length).toBe(1);
  });

  it('should prefer the entries passed via options', async () => {
    service.entries = ENTRIES;
    const matches = await firstValueFrom(
      service.lookup(
        { text: 'gamma', limit: 10 },
        { entries: [{ id: 'gamma', value: 'gamma' }] },
      ),
    );
    expect(matches.map((e) => e.id)).toEqual(['gamma']);
  });

  it('should get an entry by ID', async () => {
    service.entries = ENTRIES;
    expect(await firstValueFrom(service.getById('Beta'))).toEqual(ENTRIES[2]);
    expect(await firstValueFrom(service.getById('none'))).toBeUndefined();
  });

  it('should get the entry name', () => {
    expect(service.getName(ENTRIES[0])).toBe('Alpha');
    expect(service.getName(undefined)).toBe('');
  });
});
