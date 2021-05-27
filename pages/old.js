import Link from "next/link";
import { readFile } from "fs/promises";

export default function IndexPage({ diff }) {
  return (
    <main>
      <h1>
        <em>Trifles</em> vs. "A Jury of Her Peers"
      </h1>
      <div className="diff-container">
        {diff.map(
          ({
            story,
            story_idx,
            play,
            play_idx,
            highlighted_play2,
            highlighted_story2,
            annotation
          }) => (
            <div className="diff-row">
              <div
                className="diff-item"
                dangerouslySetInnerHTML={{
                  __html:
                    play_idx !== undefined
                      ? `[${play_idx}] ${highlighted_play2 ?? play}`
                      : ""
                }}
              />
              <div
                className="diff-item"
                dangerouslySetInnerHTML={{
                  __html:
                    story_idx !== undefined
                      ? `[${story_idx}] ${highlighted_story2 ?? story}`
                      : null
                }}
              />
              <div className="diff-item">{annotation}</div>
            </div>
          )
        )}
      </div>
    </main>
  );
}

export async function getStaticProps(context) {
  return {
    props: {
      diff: JSON.parse(await readFile("data.json"))
    }
  };
}
