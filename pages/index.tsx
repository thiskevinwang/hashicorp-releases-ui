import { useCallback, useMemo } from "react";
import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import type { Releases, Versions } from "types/releases";
import semver from "semver";

import { GitHub } from "components/github";
import { Sun } from "components/sun";
import { Moon } from "components/moon";

export const getStaticProps = async () => {
  try {
    const data: Releases =
      process.env.NODE_ENV === "production"
        ? await fetch("https://releases.hashicorp.com/index.json").then((res) => res.json())
        : (await import("data/releases/index.json")).default;

    return {
      // Uncommenting this causes the serverless function to crash
      // revalidate: 60 * 60, // 1hr
      props: {
        data,
      },
    };
  } catch (err) {
    console.error(err);
  }
};

const getKeys = (object: object) => Object.keys(object);

const reducerFn = (acc: string[][], next: string, i: number) => {
  if (i > 0) {
    let diff: string | null;
    const prevV = acc.slice(-1)[0][0];
    const nextV = semver.coerce(next)!;
    diff = semver.diff(prevV, nextV);

    if (diff === null || diff.match(/patch|prerelease/gi)) {
      acc[acc.length - 1].push(next);
    } else {
      acc.push([next]);
    }
  } else {
    acc.push([next]);
  }
  return acc;
};

type P = NextPage<InferGetStaticPropsType<typeof getStaticProps>>;
const Home: P = ({ data }) => {
  const entries = useMemo(() => Object.entries(data as Releases), [data]);

  const getListsAndKeys = useCallback((versions: Versions) => {
    const versionKeys = getKeys(versions);
    const vLists = versionKeys
      .sort((a, b) => semver.compare(semver.coerce(a)!, semver.coerce(b)!))
      .reduce(reducerFn, [] as string[][]);
    return { vLists, versionKeys };
  }, []);

  return (
    <div className="font-sans text-sm min-h-screen bg-white dark:bg-black">
      <Head>
        <title>HashiCorp releases UI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style jsx>{`
        :global(html):not(.dark) .moon {
          display: none;
        }
        :global(html.dark) .sun {
          display: none;
        }
        details > summary {
          list-style: none;
        }
        details summary::-webkit-details-marker,
        details summary::marker {
          display: none;
        }
        details:first-of-type summary {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        details:last-of-type summary {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      `}</style>

      <main className="pb-24">
        <nav className="text-black dark:text-white bg-white dark:bg-black h-16 sticky top-0 flex flex-row justify-between items-center z-20 border-gray-300 dark:border-gray-600 border-b px-2 sm:px-10 md:px-20">
          <button
            onClick={() => {
              document.documentElement.classList.toggle("dark");
            }}
          >
            <span className="sun">
              <Sun />
            </span>
            <span className="moon">
              <Moon />
            </span>
          </button>

          <div>
            <a
              href="https://github.com/thiskevinwang/hashicorp-releases-ui"
              className="text-black dark:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GitHub />
            </a>
          </div>
        </nav>

        <div className={["dark:text-white relative", "mt-4 mx-2 sm:mx-10 md:mx-20"].join(" ")}>
          {entries.map(([key, { name, versions }]) => {
            const { vLists, versionKeys } = getListsAndKeys(versions);
            return (
              <details
                key={key}
                className={[
                  "border-gray-300 dark:border-gray-600",
                  "border-b first-of-type:border-t",
                  "first-of-type:rounded-t-md last-of-type:rounded-b-md",
                ].join(" ")}
              >
                <summary
                  className={[
                    "sticky top-16",
                    "select-none cursor-pointer p-2",
                    "bg-white dark:bg-black",
                    "z-10",
                    "border-gray-300 dark:border-gray-600",
                    "border-t border-b border-l border-r",
                    "-my-px",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "transition-colors",
                  ].join(" ")}
                >
                  {key}&nbsp;
                  <span className="dark:text-white text-xs rounded-full bg-gray-300 dark:bg-gray-600 px-sm">
                    {versionKeys.length}
                  </span>
                </summary>

                <div className="border-l border-r  border-gray-300 dark:border-gray-600 border-t max-h-80 overflow-y-auto relative">
                  <div className="max-w-full overflow-x-auto flex flex-row">
                    {vLists.map((vList, i) => {
                      // columns
                      return (
                        <div
                          key={i}
                          className={[
                            "pb-3 px-2",
                            "border-r border-l first-of-type:border-l-0 last-of-type:border-r-0 border-gray-300 dark:border-gray-600",
                            "-ml-px first-of-type:ml-0",
                          ].join(" ")}
                        >
                          <h2
                            className={[
                              "font-semibold text-base",
                              "sticky top-0 mb-2 p-2",
                              "border-gray-300 dark:border-gray-600 border-b",
                              "bg-white dark:bg-black",
                            ].join(" ")}
                          >
                            {semver.coerce(vList[0])!.major}.{semver.coerce(vList[0])!.minor}.x
                          </h2>

                          {vList.map((v, i) => {
                            return (
                              <div key={v}>
                                <span className="text-xs font-medium leading-4 border border-current inline-block px-2 mb-1 rounded-full whitespace-nowrap">
                                  {v}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
