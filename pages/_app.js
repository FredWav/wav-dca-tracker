import '../styles/globals.css';

/**
 * Custom App component that wraps all pages. This is required to import
 * global styles and to provide a consistent layout in the future.
 */
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}