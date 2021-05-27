import { readFile } from "fs/promises";
import { useState, useMemo } from "react";
import * as elasticlunr from "elasticlunr";
import { IconDatabase, IconDatabaseOff, IconExternalLink } from "@tabler/icons";

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const NumberIndicator = ({ value }) =>
  value !== null && value !== undefined ? (
    <span className="number">{value}</span>
  ) : null;

const AdvancedToggle = ({ on, onClick }) => (
  <div class="tooltip">
    <button className="icon-button" onClick={onClick}>
      {on ? <IconDatabase size={16} /> : <IconDatabaseOff size={16} />}
    </button>
    <span class="tooltip-text">Toggle advanced stats</span>
  </div>
);

const LinkButton = ({ href }) => (
  <a
    rel="noopener noreferrer nofollow"
    target="_blank"
    className="icon-button"
    href={href}
  >
    <IconExternalLink size={16} />
  </a>
);

// TODO: split into components
export default function MainPage({ diff }) {
  const [filter, setFilter] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const lunr = useMemo(() => {
    if (!diff) return;

    const lunr = elasticlunr();

    lunr.addField("play_text");
    lunr.addField("story_text");
    lunr.setRef("index");

    diff.forEach(({ story_text, play_text, annotations }, index) => {
      lunr.addDoc({ index, play_text, story_text });
    });

    return lunr;
  }, [diff]);

  const filteredDiff = useMemo(
    () =>
      lunr && filter
        ? lunr
            .search(filter)
            .sort(({ ref: a }, { ref: b }) => a - b)
            .map(({ ref }) => diff[ref])
        : diff,
    [diff, lunr, filter]
  );

  return (
    <main>
      <h1>
        <em>Trifles</em> and "A Jury of Her Peers"
      </h1>
      <h3>By Susan Glaspell</h3>
      <div className="diff-container">
        <div className="diff-row diff-header">
          <div className="diff-item header">
            <em>Trifles </em>
            <LinkButton href="https://www.gutenberg.org/files/59432/59432-h/59432-h.htm#Page_1" />
          </div>
          <div className="diff-item header">
            "A Jury of Her Peers"{" "}
            <LinkButton href="https://www.gutenberg.org/files/20872/20872-h/20872-h.htm#A_JURY_OF_HER_PEERS11" />
          </div>
          <div className="diff-item header">
            Annotations{" "}
            <AdvancedToggle
              on={advancedMode}
              onClick={() => setAdvancedMode((prev) => !prev)}
            />
          </div>
        </div>
        <div className="diff-row">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter"
            placeholder="Search for a word or phrase..."
          />
        </div>
        {filteredDiff && !filteredDiff.length && (
          <div className="diff-row">
            <div
              className="diff-item"
              style={{ fontWeight: 600, fontStyle: "italic" }}
            >
              No results found for that query! Continue typing or try searching
              for something else.
            </div>
          </div>
        )}
        {(filteredDiff && !filteredDiff.length ? diff : filteredDiff).map(
          ({
            play,
            story_text,
            play_text,
            story,
            annotations,
            entities,
            pos
          }) => {
            const displayPos = ["VERB", "ADJ", "ADV"];
            const filteredPos = Object.entries(pos)
              .filter(([type, items]) => displayPos.includes(type))
              .sort(
                ([a], [b]) => displayPos.indexOf(a) - displayPos.indexOf(b)
              );

            return (
              <div className="diff-row">
                <div className="diff-item">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: play_text || ""
                    }}
                  />
                  <NumberIndicator value={play[0]?.index} />
                </div>
                <div className="diff-item">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: story_text || ""
                    }}
                  />
                  <NumberIndicator value={story[0]?.index} />
                </div>
                <div className="diff-item annotations">
                  {annotations.map((text) =>
                    text ? <div className="annotation">{text}</div> : null
                  )}
                  {advancedMode && entities.length ? (
                    <div className="entities">
                      {Object.entries(groupBy(entities, 1)).map(
                        ([type, items]) => (
                          <>
                            <span className="entity-type">{type}</span>
                            <span className="entity-name">
                              {items.map(([name, type]) => name).join(", ")}
                            </span>
                          </>
                        )
                      )}
                    </div>
                  ) : null}
                  {advancedMode && filteredPos.length ? (
                    <div className="entities">
                      {filteredPos.map(([type, items]) => (
                        <>
                          <span className="entity-type">{type}</span>
                          <span className="entity-name">
                            {items.join(", ")}
                          </span>
                        </>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }
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
