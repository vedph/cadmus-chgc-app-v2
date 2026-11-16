import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ThesaurusService } from '@myrmidon/cadmus-api';
import { Thesaurus } from '@myrmidon/cadmus-core';

import { AnnotationThesauriService } from './annotation-thesauri.service';

const THESAURUS: Thesaurus = {
  id: 'chgc-ids',
  language: 'en',
  entries: [{ id: 'a', value: 'a' }],
};

describe('AnnotationThesauriService', () => {
  let thesService: { getThesaurus: ReturnType<typeof vi.fn> };
  let service: AnnotationThesauriService;

  beforeEach(() => {
    thesService = { getThesaurus: vi.fn().mockReturnValue(of(THESAURUS)) };
    TestBed.configureTestingModule({
      providers: [{ provide: ThesaurusService, useValue: thesService }],
    });
    service = TestBed.inject(AnnotationThesauriService);
  });

  it('should load the thesaurus entries', async () => {
    const entries = await service.getThesaurusEntries('chgc-ids');
    expect(entries).toEqual(THESAURUS.entries);
    expect(thesService.getThesaurus).toHaveBeenCalledWith('chgc-ids');
  });

  it('should load each thesaurus once', async () => {
    await Promise.all([
      service.getThesaurusEntries('chgc-ids'),
      service.getThesaurusEntries('chgc-ids'),
    ]);
    await service.getThesaurusEntries('chgc-ids');
    expect(thesService.getThesaurus).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array for a thesaurus without entries', async () => {
    thesService.getThesaurus.mockReturnValue(of({ ...THESAURUS, entries: undefined }));
    expect(await service.getThesaurusEntries('chgc-ids')).toEqual([]);
  });

  it('should use a seeded thesaurus without loading it', async () => {
    service.setThesaurus({ ...THESAURUS, entries: [{ id: 'x', value: 'x' }] });
    const entries = await service.getThesaurusEntries('chgc-ids');
    expect(entries).toEqual([{ id: 'x', value: 'x' }]);
    expect(thesService.getThesaurus).not.toHaveBeenCalled();
  });

  it('should seed a thesaurus under its ID without the language suffix', async () => {
    service.setThesaurus({ ...THESAURUS, id: 'chgc-ids@en', entries: [] });
    expect(await service.getThesaurusEntries('chgc-ids')).toEqual([]);
    expect(thesService.getThesaurus).not.toHaveBeenCalled();
  });

  it('should seed a thesaurus under the specified ID', async () => {
    service.setThesaurus({ ...THESAURUS, id: 'other@en', entries: [] }, 'chgc-ids');
    expect(await service.getThesaurusEntries('chgc-ids')).toEqual([]);
    expect(thesService.getThesaurus).not.toHaveBeenCalled();
  });

  it('should not cache a failed download', async () => {
    thesService.getThesaurus.mockReturnValueOnce(
      throwError(() => new Error('network')),
    );
    await expect(service.getThesaurusEntries('chgc-ids')).rejects.toThrow(
      'network',
    );
    const entries = await service.getThesaurusEntries('chgc-ids');
    expect(entries).toEqual(THESAURUS.entries);
    expect(thesService.getThesaurus).toHaveBeenCalledTimes(2);
  });
});
