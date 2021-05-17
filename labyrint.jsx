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

  const steps = ["goals", "actors", "targets", "consequences", "actions"];
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex];

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
    }, 300),
    []
  );

  const onOptionSelected = React.useCallback(
    (option) => {
      const newFilter = {
        key: step,
        value: option,
      };
      const newFilters = [...filters, newFilter];

      setFilters(newFilters);
      setConspiracies(applyFilters(conspiraciesData, newFilters));
      setStepIndex(stepIndex + 1);
    },
    [
      step,
      stepIndex,
      setStepIndex,
      filters,
      setFilters,
      conspiracies,
      setConspiracies,
    ]
  );

  const back = React.useCallback(() => {
    if (filters.length === 0) {
      setHasEntered(false);
    } else {
      const newFilters = filters.slice(0, -1);
      setFilters(newFilters);
      setConspiracies(applyFilters(conspiraciesData, newFilters));
      setStepIndex(stepIndex - 1);
    }
  }, [filters, setHasEntered, setFilters, setConspiracies, setStepIndex]);

  React.useEffect(() => {
    onResize();
  }, [hasEntered, stepIndex, onResize]);

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const options = sortBy(
    uniq(
      conspiracies.reduce((carry, conspiracy) => {
        return carry.concat(conspiracy[step]);
      }, [])
    ),
    (o) => o
  );

  const showIntro = !hasEntered;
  const showResults =
    !showIntro && (conspiracies.length <= 3 || stepIndex >= steps.length - 1);
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
            Vítejte v labyrintu vakcinačních konspirací. Nacházíte se na začátku
            virtuálního prostoru, v jehož chodbách číhají různé záškodné entity.
            O některých jste již možná slyšeli, jiné se ze stínů vynořily teprve
            nedávno. Všechny mají ale společné jedno: chtějí vás navést do slepé
            uličky mýtů, polopravd a lží ohledně původu a efektů vakcín proti
            nemoci covid-19.
          </p>
          <p className="p2">
            Na této stránce si tak můžete vyzkoušet cestu do šera postfaktického
            světa internetu za časů pandemie. V prvním kroku volíte cíl daného
            konspiračního narativu, následně údajného původce této aktivity,
            poté její oběť, a nakonec konkrétní následky na těchto obětech. Na
            konci na vás vždy bude čekat odkaz na konkrétní konspirační článek a
            také možnost vrátit se na začátek labyrintu. Hodně štěstí!
          </p>
          <button
            type="button"
            className="primary-link enter"
            onClick={() => setHasEntered(true)}
          >
            <span className="text">Vstoupit do labyrintu</span> →
          </button>
          <div class="illustration-credit">
            Autorem ilustrace labyrintu je{" "}
            <a
              href="https://thenounproject.com/term/maze/2871969"
              target="_blank"
            >
              Alexander Skowalsky
            </a>
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
          {step === "actions" && <p>Jaké akce by měly být použity?</p>}

          <div className="options">
            {options.map((option, index) => (
              <button
                key={step + "-" + index}
                type="button"
                className="primary-link"
                onClick={() => onOptionSelected(option)}
              >
                <span className="text">{option}</span> →
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
              <div key={conspiracy.sources_no} className="article">
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
                    {conspiracy.title}
                  </a>{" "}
                  <div className="article-server">{conspiracy.server}</div>
                </div>
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

const applyFilters = (conspiracies, filters) => {
  const filtered = conspiracies.filter((conspiracy) => {
    return filters.every((filter) => {
      return conspiracy[filter.key].includes(filter.value);
    });
  });

  return orderBy(filtered, ["title", "server"], ["asc", "asc"]);
};

const availableArticleIllustrations = [3, 21];

const getArticleIllustrationUrl = (conspiracy) => {
  console.log("-----------", { conspiracy });
  if (availableArticleIllustrations.includes(conspiracy.sources_no)) {
    return `article-illustrations/${conspiracy.sources_no}.jpg`;
  }

  return "article-illustration-placeholder.svg";
};

const container = document.getElementById("antivax-konspirace-labyrint");
if (container) {
  ReactDOM.render(<LabyrintApp />, container);
}
