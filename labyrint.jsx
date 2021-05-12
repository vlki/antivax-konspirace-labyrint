// polyfills
import "core-js/stable";
import "whatwg-fetch";

import React from "react";
import ReactDOM from "react-dom";
import { sortBy, uniq } from "lodash";

import conspiraciesData from "./data.json";

const LabyrintApp = () => {
  const [conspiracies, setConspiracies] = React.useState(conspiraciesData);
  const [filters, setFilters] = React.useState([]);

  const steps = ["goals", "actors", "targets", "consequences", "actions"];
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex];

  const onOptionSelected = React.useCallback(
    (option) => {
      const newFilter = {
        key: step,
        value: option,
      };
      const newFilters = [...filters, newFilter];

      setFilters(newFilters);
      setConspiracies(applyFilters(conspiracies, newFilters));
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

  const backToStart = React.useCallback(() => {
    setFilters([]);
    setConspiracies(conspiraciesData);
    setStepIndex(0);
  }, [setFilters, setConspiracies, setStepIndex]);

  const options = sortBy(
    uniq(
      conspiracies.reduce((carry, conspiracy) => {
        return carry.concat(conspiracy[step]);
      }, [])
    ),
    (o) => o
  );

  const isIntro = filters.length === 0;
  const showResults = conspiracies.length <= 3 || stepIndex >= steps.length - 1;

  return (
    <div className="antivax-konspirace-labyrint-app">
      {!showResults && (
        <>
          {isIntro && (
            <p>
              Vítejte v labyrintu antivax konspirací, labyrintu narativů
              týkajících se vakcín proti covid-19.
            </p>
          )}

          {filters.length > 0 && (
            <p>
              Zatím jste vybrali:{" "}
              {filters
                .map(
                  (filter) =>
                    ({
                      goals: "cíl",
                      actors: "aktéra",
                      targets: "cílovou skupinu",
                      consequences: "následky",
                      actions: "akce",
                    }[filter.key] +
                    " " +
                    filter.value)
                )
                .join(", ")}
            </p>
          )}

          {step === "goals" && (
            <p>Jaký cíl byste si přáli, aby konspirace měla?</p>
          )}
          {step === "actors" && <p>Kdo by měl za konspirací stát?</p>}
          {step === "targets" && <p>Kdo by měl nést následky?</p>}
          {step === "consequences" && <p>Jaké následky by to měly být?</p>}
          {step === "actions" && <p>Jak by se mělo cíle dosáhnout?</p>}

          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onOptionSelected(option)}
            >
              {option}
            </button>
          ))}

          {!isIntro && (
            <p>
              <button type="button" onClick={() => backToStart()}>
                Zpět na začátek labyrintu
              </button>
            </p>
          )}

          {/* <p>{conspiracies.length}</p> */}
        </>
      )}

      {showResults && (
        <>
          {filters.length > 0 && (
            <p>
              Vybrali jste:{" "}
              {filters
                .map(
                  (filter) =>
                    ({
                      goals: "cíl",
                      actors: "aktéra",
                      targets: "cílovou skupinu",
                      consequences: "následky",
                      actions: "akce",
                    }[filter.key] +
                    " " +
                    filter.value)
                )
                .join(", ")}
            </p>
          )}

          <p>
            Tak to by Vás mohly zajímat konspirace z{" "}
            {conspiracies.length > 1
              ? "následujících článků"
              : "následujícího článku"}
            !
          </p>

          {conspiracies.map((conspiracy) => (
            <div key={conspiracy.sources_no}>
              <p>
                <a href={conspiracy.link} target="_blank">
                  {conspiracy.title}
                </a>{" "}
                ({conspiracy.server})
              </p>
            </div>
          ))}

          <p>
            <button type="button" onClick={() => backToStart()}>
              Zpět na začátek labyrintu
            </button>
          </p>
        </>
      )}
    </div>
  );
};

const applyFilters = (conspiracies, filters) => {
  return conspiracies.filter((conspiracy) => {
    return filters.every((filter) => {
      return conspiracy[filter.key].includes(filter.value);
    });
  });
};

const container = document.getElementById("antivax-konspirace-labyrint");
if (container) {
  ReactDOM.render(<LabyrintApp />, container);
}
