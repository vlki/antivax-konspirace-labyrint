// polyfills
import "core-js/stable";
import "whatwg-fetch";

import React from "react";
import ReactDOM from "react-dom";
import { debounce, orderBy, sortBy, uniq } from "lodash";

import conspiraciesData from "./data.json";

const LabyrintApp = () => {
  const [hasEntered, setHasEntered] = React.useState(false);
  const [conspiracies, setConspiracies] = React.useState(conspiraciesData);
  const [filters, setFilters] = React.useState([]);
  const [steps, setSteps] = React.useState(allSteps);

  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex];

  const [showCoding, setShowCoding] = React.useState(false);

  const onResize = React.useCallback(
    debounce(() => {
      const appElement = document.getElementById(
        "antivax-konspirace-labyrint-app"
      );
      if (appElement) {
        const { height } = appElement.getBoundingClientRect();
        if (window.parent) {
          window.parent.postMessage(
            {
              app: "antivax-konspirace-labyrint",
              type: "resize",
              data: {
                height,
              },
            },
            "*"
          );
        }
      }
    }, 50),
    []
  );

  const onOptionSelected = React.useCallback(
    (option) => {
      const newFilter = {
        key: step,
        value: option,
      };

      const newFilters = [...filters, newFilter];
      const newConspiracies = applyFilters(conspiraciesData, newFilters);
      const newStepIndex = stepIndex + 1;
      const newSteps = computeSteps(newFilters, newConspiracies, newStepIndex);

      setFilters(newFilters);
      setConspiracies(newConspiracies);
      setStepIndex(newStepIndex);
      setSteps(newSteps);
    },
    [
      step,
      stepIndex,
      setStepIndex,
      filters,
      setFilters,
      setConspiracies,
      setSteps,
    ]
  );

  const back = React.useCallback(() => {
    if (filters.length === 0) {
      setHasEntered(false);
    } else {
      const newFilters = filters.slice(0, -1);
      const newConspiracies = applyFilters(conspiraciesData, newFilters);
      const newStepIndex = stepIndex - 1;
      const newSteps = computeSteps(newFilters, newConspiracies, newStepIndex);

      setFilters(newFilters);
      setConspiracies(newConspiracies);
      setStepIndex(newStepIndex);
      setSteps(newSteps);
    }

    setShowCoding(false);
  }, [
    filters,
    setHasEntered,
    setFilters,
    setConspiracies,
    setStepIndex,
    setSteps,
    setShowCoding,
  ]);

  React.useEffect(() => {
    onResize();
  }, [hasEntered, stepIndex, onResize]);

  React.useEffect(() => {
    // First load can take longer
    setTimeout(() => {
      onResize();
    }, 200);

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const showArticleCoding = React.useCallback(
    (conspiracy) => {
      setShowCoding(
        showCoding === conspiracy.sources_no ? false : conspiracy.sources_no
      );
      onResize();
    },
    [setShowCoding, showCoding, onResize]
  );

  const options = prepareOptions(conspiracies, step);

  const showIntro = !hasEntered;
  const showResults =
    !showIntro && (conspiracies.length <= 2 || stepIndex > steps.length - 1);
  const showQuestion = !showIntro && !showResults;

  return (
    <div
      className="antivax-konspirace-labyrint-app"
      id="antivax-konspirace-labyrint-app"
    >
      {showIntro && (
        <div className="screen-intro">
          <img src="labyrint.svg" alt="Labyrint konspirací" />
          <h1>Antivax labyrint</h1>
          <p className="p1">
            Vítejte v&nbsp;labyrintu vakcinačních konspirací. Nacházíte se na
            začátku virtuálního prostoru, v&nbsp;jehož chodbách číhají různé
            záškodné entity. O&nbsp;některých jste již možná slyšeli, jiné se ze
            stínů vynořily teprve nedávno. Všechny mají ale společné jedno:
            chtějí vás navést do slepé uličky mýtů, polopravd a&nbsp;lží ohledně
            původu a&nbsp;efektů vakcín proti nemoci covid-19.
          </p>
          <p className="p2">
            V&nbsp;této aplikaci si tak můžete vyzkoušet cestu do šera
            postfaktického světa internetu za časů pandemie. V&nbsp;prvním kroku
            volíte údajného původce konspiračního narativu, následně cíl daných
            aktivit, poté oběť a&nbsp;následky na nich a&nbsp;nakonec konkrétní
            prováděné akce. Na konci na vás vždy budou čekat odkazy na konkrétní
            konspirační články. Hodně štěstí!
          </p>
          <button
            type="button"
            className="primary-link enter"
            onClick={() => setHasEntered(true)}
          >
            <span className="text">Vstoupit do labyrintu</span> →
          </button>
          <div class="illustration-credit">
            Autorem{" "}
            <a
              href="https://thenounproject.com/term/maze/2871969"
              target="_blank"
            >
              ilustrace labyrintu
            </a>{" "}
            je Alexander Skowalsky (
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
            >
              CC&nbsp;BY
            </a>
            )
          </div>
        </div>
      )}

      {showQuestion && (
        <div className="screen-question">
          <img src="labyrint.svg" alt="Labyrint konspirací" />

          {filters.length > 0 && (
            <div className="filters">
              Vaše dosavadní volby:{" "}
              {filters
                .map(
                  (filter) =>
                    ({
                      goals: "cíl",
                      actors: "původce",
                      targets: "oběť",
                      consequences: "následky",
                      actions: "akce",
                    }[filter.key] +
                    " " +
                    filter.value)
                )
                .join(", ")}
            </div>
          )}

          {step === "goals" && (
            <h2>Jaký cíl si přejete, aby konspirace měla?</h2>
          )}
          {step === "actors" && (
            <h2>Kdo má být mezi původci konspiračních aktivit?</h2>
          )}
          {step === "targets" && <h2>Kdo má být obětí?</h2>}
          {step === "consequences" && <h2>Jaké následky má oběť nést?</h2>}
          {step === "actions" && <h2>Jaké akce by měly být použity?</h2>}

          <div className="options">
            {options.map((option, index) => (
              <button
                key={step + "-" + index}
                type="button"
                className="primary-link"
                onClick={() => onOptionSelected(option)}
              >
                <span className="text">{option}</span>&nbsp;→
              </button>
            ))}
          </div>

          <div className="filler"></div>

          <button
            type="button"
            className="secondary-link back-link"
            onClick={() => back()}
          >
            ← <span className="text">O krok zpět</span>
          </button>

          {/* <p>{conspiracies.length}</p> */}
        </div>
      )}

      {showResults && (
        <div className="screen-results">
          <img src="labyrint.svg" alt="Labyrint konspirací" />

          {filters.length > 0 && (
            <div class="filters">
              Vaše volby –&nbsp;
              {filters
                .map(
                  (filter) =>
                    ({
                      goals: "cíl",
                      actors: "původce",
                      targets: "oběť",
                      consequences: "následky",
                      actions: "akce",
                    }[filter.key] +
                    " " +
                    filter.value)
                )
                .join(", ")}{" "}
              –&nbsp;Vás dovedly do místnosti s následujícimi články.
            </div>
          )}

          <div className="articles-list">
            {conspiracies.map((conspiracy) => (
              <div
                key={"conspiracy-" + conspiracy.sources_no}
                className={
                  `article` +
                  (showCoding === conspiracy.sources_no
                    ? " article-show-coding"
                    : "")
                }
              >
                <div className="article-main">
                  <a
                    href={conspiracy.link}
                    target="_blank"
                    className="article-illustration"
                  >
                    <img
                      src={getArticleIllustrationUrl(conspiracy)}
                      alt={conspiracy.title + " (" + conspiracy.server + ")"}
                    />
                  </a>
                  <div className="article-other">
                    <a
                      href={conspiracy.link}
                      target="_blank"
                      className="primary-link article-link"
                    >
                      <span className="text">{conspiracy.title}</span>
                    </a>{" "}
                    <div className="article-server">{conspiracy.server}</div>
                    <button
                      type="button"
                      className="secondary-link"
                      onClick={() => showArticleCoding(conspiracy)}
                    >
                      <span className="text">
                        {showCoding === conspiracy.sources_no
                          ? "Skrýt narativ"
                          : "Zobrazit narativ"}
                      </span>
                    </button>
                  </div>
                </div>

                {showCoding === conspiracy.sources_no && (
                  <div className="article-coding">
                    {buildArticleNarrativeSentence(conspiracy)}

                    <div className="source">
                      Kódování dle metodiky z: INTRONE, Joshua, Ania KORSUNSKA,
                      Leni KRSOVA a Zefeng ZHANG. Mapping the Narrative
                      Ecosystem of Conspiracy Theories in Online
                      Anti-vaccination Discussions. In: International Conference
                      on Social Media and Society [online]. New York, NY, USA:
                      ACM, 2020, 2020-07-22, s. 184-192 [cit. 2021-5-19]. ISBN
                      9781450376884. Dostupné z: doi:10.1145/3400806.3400828
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="filler"></div>

          <button
            type="button"
            className="secondary-link back-link"
            onClick={() => back()}
          >
            ← <span className="text">O krok zpět</span>
          </button>
        </div>
      )}
    </div>
  );
};

const allSteps = ["actors", "goals", "targets", "consequences", "actions"];

const applyFilters = (conspiracies, filters) => {
  const filtered = conspiracies.filter((conspiracy) => {
    return filters.every((filter) => {
      return conspiracy[filter.key].includes(filter.value);
    });
  });

  return orderBy(filtered, ["title", "server"], ["asc", "asc"]);
};

const prepareOptions = (conspiracies, step) =>
  sortBy(
    uniq(
      conspiracies.reduce((carry, conspiracy) => {
        return carry.concat(conspiracy[step]);
      }, [])
    ),
    (o) => o
  );

const computeSteps = (filters, conspiracies, stepIndex) => {
  const newSteps = [];

  for (const step of allSteps) {
    if (filters.find((filter) => filter.key === step)) {
      newSteps.push(step);
      continue;
    }

    const options = prepareOptions(conspiracies, step);
    if (options.length === 1) {
      // If there is only one option to choose from, just remove that step
      continue;
    }

    const allConspiraciesHaveAllOptions = conspiracies.every((conspiracy) => {
      return options.every((option) => conspiracy[step].includes(option));
    });
    if (allConspiraciesHaveAllOptions) {
      // If all conspiracies have all options, meaning choosing does not change
      // anything, then just remove that step too
      continue;
    }

    newSteps.push(step);
    continue;
  }

  return newSteps;
};

const availableArticleIllustrations = [
  2, 3, 7, 8, 9,

  11, 12, 13, 14, 15, 16, 17, 18, 19,

  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,

  30, 31, 32, 33, 34, 35, 36, 37,

  40, 41, 43, 44, 45, 46, 48, 49,

  50, 51,
];

const getArticleIllustrationUrl = (conspiracy) => {
  if (availableArticleIllustrations.includes(conspiracy.sources_no)) {
    return `article-illustrations/${conspiracy.sources_no}.jpg`;
  }

  return "article-illustration-placeholder.svg";
};

const buildArticleNarrativeSentence = (conspiracy) => {
  const events = buildArticleNarrativeSentencePart(
    conspiracy.events,
    "událost",
    "události"
  );
  const actors = buildArticleNarrativeSentencePart(
    conspiracy.actors,
    "aktéra",
    "aktérů"
  );
  const goals = buildArticleNarrativeSentencePart(
    conspiracy.goals,
    "s cílem",
    "s cíli"
  );
  const actions = buildArticleNarrativeSentencePart(
    conspiracy.actions,
    "akce",
    "akcí"
  );
  const consequences = buildArticleNarrativeSentencePart(
    conspiracy.consequences,
    "s následkem",
    "s následky"
  );
  const targets = buildArticleNarrativeSentencePart(
    conspiracy.targets,
    "oběť",
    "oběti"
  );

  return (
    <>
      Konspirační narativ v článku vysvětluje {events} jako koordinovanou akci{" "}
      {actors} {goals} pomocí {actions} {consequences} pro {targets}.
    </>
  );
};

const buildArticleNarrativeSentencePart = (
  values,
  singleLabel = null,
  multipleLabel = null
) => {
  let part = (
    <>
      {singleLabel !== null && multipleLabel !== null && <>{singleLabel} </>}
      <em>{"(chybí)"}</em>
    </>
  );

  if (values.length > 0) {
    part = [];

    if (singleLabel !== null && multipleLabel !== null) {
      part.push(
        <React.Fragment key="label">
          {values.length === 1 ? `${singleLabel} ` : `${multipleLabel} `}
        </React.Fragment>
      );
    }

    sortBy(values, (v) => v).forEach((value, index) => {
      if (index > 0 && index === values.length - 1) {
        part.push(
          <React.Fragment key={`delimiter-${index}`}> a </React.Fragment>
        );
      } else if (index > 0) {
        part.push(
          <React.Fragment key={`delimiter-${index}`}>, </React.Fragment>
        );
      }

      part.push(<em key={value}>{value}</em>);
    });
  }

  return part;
};

const container = document.getElementById("antivax-konspirace-labyrint");
if (container) {
  ReactDOM.render(<LabyrintApp />, container);
}
