import { call, take, all, select, takeLatest } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import {
  allowAnonymousSelector,
  fetchLanguageSaga,
  watchFetchLanguageSaga,
} from './fetchLanguageSagas';
import { LanguageActions } from '../languageSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getLanguageFromCode } from 'altinn-shared/language';
import * as language from 'altinn-shared/language';
import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';

describe('languageActions', () => {
  it('should create an action with correct type: FETCH_LANGUAGE', () => {
    const expectedAction = {
      type: 'language/fetchLanguage',
    };
    expect(LanguageActions.fetchLanguage()).toEqual(expectedAction);
  });
  it('should create an action with correct type: FETCH_LANGUAGE_FULFILLED', () => {
    const expectedAction = {
      type: 'language/fetchLanguageFulfilled',
      payload: {
        language: {},
      },
    };
    expect(LanguageActions.fetchLanguageFulfilled({ language: {} })).toEqual(expectedAction);
  });
  it('should create an action with correct type: FETCH_LANGUAGE_REJECTED', () => {
    const mockError: Error = new Error();
    const expectedAction = {
      type: 'language/fetchLanguageRejected',
      payload: {
        error: mockError,
      },
    };
    expect(LanguageActions.fetchLanguageRejected({ error: mockError })).toEqual(
      expectedAction,
    );
  });
});

describe('fetchLanguageSagas', () => {
  it('should dispatch action "language/fetchLanguage" ', () => {
    const generator = watchFetchLanguageSaga();
    expect(generator.next().value).toEqual(
      all([
        take(FormLayoutActions.fetchLayoutSetsFulfilled),
        take('APPLICATION_METADATA.FETCH_APPLICATION_METADATA_FULFILLED'),
        take(LanguageActions.fetchLanguage),
      ]),
    );
    expect(generator.next().value).toEqual(select(allowAnonymousSelector));
    expect(generator.next().value).toEqual(take('PROFILE.FETCH_PROFILE_FULFILLED'));
    expect(generator.next().value).toEqual(call(fetchLanguageSaga));
    expect(generator.next().value).toEqual(takeLatest(LanguageActions.updateSelectedAppLanguage,fetchLanguageSaga));
    expect(generator.next().done).toBeTruthy();
  });

  it('should fetch default language when defaultLanguage is true', () => {

    return expectSaga(fetchLanguageSaga, true)
      .provide([
        [select(appLanguageStateSelector), "en"],
      ])
      .put(LanguageActions.fetchLanguageFulfilled({ language: getLanguageFromCode('nb') }))
      .run();
  });

  it('should fetch language from app language state', () => {
    return expectSaga(fetchLanguageSaga)
      .provide([
        [select(appLanguageStateSelector), "en"]
      ])
      .put(LanguageActions.fetchLanguageFulfilled({ language: getLanguageFromCode('en') }))
      .run();
  });

  it('should handle error in fetchLanguageSaga', () => {
    const error = new Error('error');
    jest.spyOn(language, 'getLanguageFromCode').mockImplementation(() => {
      throw error;
    });
    expectSaga(fetchLanguageSaga, true)
    .put(LanguageActions.fetchLanguageRejected({ error }))
    .run();
  })
});
