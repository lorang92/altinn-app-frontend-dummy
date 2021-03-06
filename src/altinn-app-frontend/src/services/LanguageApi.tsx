import { appApi } from 'src/services/AppApi';
import { IAppLanguage } from 'altinn-shared/types';

export const languageApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppLanguage: builder.query<IAppLanguage[], void>({
      query: () => ({
        url: '/api/v1/applicationlanguages',
        method: 'GET'
      }),
    })
  }),
});

export const { useGetAppLanguageQuery } = languageApi;
