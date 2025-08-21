import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cryptoApi = createApi({
  reducerPath: 'cryptoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  endpoints: (builder) => ({
    // Get list of coins
    getCryptos: builder.query({
      query: (count) => `cryptos?limit=${count}`,
    }),

    // Get single coin details
    getCryptoDetails: builder.query({
      query: (coinId) => `crypto/${coinId}`,
    }),

    // Get coin history by timeperiod
    getCryptoHistory: builder.query({
      query: ({ coinId, timeperiod }) =>
        `crypto/${coinId}/history?timeperiod=${timeperiod}`,
    }),

    // Get exchanges list
    getExchanges: builder.query({
      query: () => `exchanges`, // optional: add a backend route if needed
    }),
  }),
});

// Export hooks
export const {
  useGetCryptosQuery,
  useGetCryptoDetailsQuery,
  useGetCryptoHistoryQuery,
  useGetExchangesQuery,
} = cryptoApi;
