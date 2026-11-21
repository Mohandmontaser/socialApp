import { TestBed } from '@angular/core/testing';

import { FolloSuggestionService } from './follo-suggestion.service';

describe('FolloSuggestionService', () => {
  let service: FolloSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolloSuggestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
