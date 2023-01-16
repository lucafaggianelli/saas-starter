import { CacheProvider, EmotionCache } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import { getSession, SessionProvider } from 'next-auth/react'
import { SnackbarProvider } from 'notistack'

import { DefaultLayout } from '~/components/DefaultLayout';
import createEmotionCache from '~/createEmotionCache';
import theme from '~/theme';
import { trpc } from '~/utils/trpc';
import ErrorBoundary from '~/components/layout/ErrorBoundaries';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const MyApp = (({
  Component,
  pageProps: { session, ...pageProps },
  emotionCache = clientSideEmotionCache,
}: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SnackbarProvider>
              {getLayout(
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
              )}
            </SnackbarProvider>
          </LocalizationProvider>

        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}) as AppType;

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    session: await getSession(ctx),
  };
};

export default trpc.withTRPC(MyApp);
