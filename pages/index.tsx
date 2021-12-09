import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import type { Releases } from "types/releases";
import semver from "semver";

export const getStaticProps = async () => {
  const data: Releases =
    process.env.NODE_ENV === "production"
      ? await fetch("https://releases.hashicorp.com/index.json").then((res) => res.json())
      : (await import("data/releases/index.json")).default;

  return {
    revalidate: 60 * 60, // 1hr
    props: {
      data,
    },
  };
};

const reducer = (acc: string[][], next: string, i: number) => {
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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-opacity font-mono ">
      <Head>
        <title>HashiCorp releases UI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style jsx>{`
        :global(html):not(.dark) .moon-light {
          display: none;
        }
        :global(html.dark) .moon-dark {
          display: none;
        }
      `}</style>

      <main className="mx-2 sm:mx-10 md:mx-20 pb-24">
        <nav className="bg-gray-50 dark:bg-gray-900 h-16 sticky top-0 flex flex-row-reverse z-10">
          <button
            onClick={() => {
              document.documentElement.classList.toggle("dark");
            }}
          >
            <span className="moon-light">🌝</span>
            <span className="moon-dark">🌚</span>
          </button>
        </nav>

        <div className="dark:text-white relative">
          {Object.entries(data).map(([key, { name, versions }]) => {
            const versionKeys = Object.keys(versions);
            const vLists = versionKeys
              .sort((a, b) => semver.compare(semver.coerce(a)!, semver.coerce(b)!))
              .reduce(reducer, [] as string[][]);
            return (
              <details key={key} className="">
                <summary className="bg-gray-50 dark:bg-gray-900 select-none cursor-pointer sticky top-16">
                  {key}&nbsp;<small className="text-gray-500 dark:text-gray-400">({versionKeys.length})</small>
                </summary>

                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-5">
                  <div className="max-w-full overflow-x-scroll flex flex-row max-h-80">
                    {vLists.map((vList, i) => {
                      // columns
                      return (
                        <div
                          key={i}
                          className={[
                            "min-h-full max-h-full",
                            "border-dashed border-r border-l first-of-type:border-l-0 last-of-type:border-r-0 border-gray-200 dark:border-gray-700",
                            "-ml-px first-of-type:ml-0",
                          ].join(" ")}
                        >
                          <small className="flex justify-center sticky top-0 text-gray-500 dark:text-gray-400 mb-2">
                            {semver.coerce(vList[0])!.major}.{semver.coerce(vList[0])!.minor}.x
                          </small>

                          {vList.map((v, i) => {
                            return (
                              <div key={v}>
                                <span className="inline-block bg-gray-200 dark:bg-gray-900 py-1 px-3 my-1 mx-2 rounded-full whitespace-nowrap dark:shadow-dark">
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
