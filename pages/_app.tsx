import { AppProps } from 'next/app';
import { Fragment } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  // uncomment block below to recalculate mood embeddings at startup
  // useEffect(() => {
  //   (async () => {
  //     const response = await fetch('/api/embeddings');
  //     const embeddings = await response.json();
  //   })();
  // }, []);

  return (
    <Fragment>
      <Component {...pageProps} />
      <style jsx global>{`
        /* Spinner CSS */
        .lds-ring {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }

        /* ... rest of the spinner CSS ... */

        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Fragment>
  );
}

export default MyApp;

