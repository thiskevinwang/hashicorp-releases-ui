import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          if (typeof window === 'undefined') return
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          
          // Whenever the user explicitly chooses light mode
          localStorage.theme = 'light'
          
          // Whenever the user explicitly chooses dark mode
          localStorage.theme = 'dark'
          
          // Whenever the user explicitly chooses to respect the OS preference
          localStorage.removeItem('theme')
        `,
        }}
      ></script>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
