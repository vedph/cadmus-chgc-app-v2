import { TestBed } from '@angular/core/testing';

import { AnnotationThesauriService } from './annotation-thesauri.service';

describe('AnnotationThesauriService', () => {
  let service: AnnotationThesauriService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationThesauriService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
