import React, { useState, useRef, useEffect, useContext } from "react";
import {
  BsPlayCircle,
  BsPauseCircle,
  BsChevronBarRight,
  BsArrowCounterclockwise,
  BsFillGearFill,
} from "react-icons/bs";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Notifier from "react-desktop-notification";

import SettingsDialog from "./Settings";
import { ConfigContext } from "./Config";

export default function Pomodoro() {
  // const counter_init_vals = {
  //   focus: 25 * 60,
  //   break: 5 * 60,
  //   longbreak: 15 * 60,
  // };
  const [config, setConfig] = useContext(ConfigContext);

  const [counter, setCounter] = useState(config.focus * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("focus"); // focus | break | long-break
  const [currentSession, setCurrentSession] = useState(1);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const timer = useRef(null);
  const firstRender = useRef(true);

  const getMinutes = (c) => {
    const minutes = Math.floor(c / 60);
    return minutes < 10 ? `0${minutes}` : minutes;
  };

  const getSeconds = (c) => {
    const seconds = Math.round(c % 60);
    return seconds < 10 ? `0${seconds}` : seconds;
  };

  const tick = () => {
    setCounter((c) => {
      if (c === 0) {
        return 0;
      } else {
        return c - 1;
      }
    });
  };

  const startTimer = () => {
    setTimerRunning(true);
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(tick, 1000);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    clearInterval(timer.current);
  };

  const resetTimer = () => {
    stopTimer();
    setTimerMode("focus");
    setCurrentSession(1);
    setCounter(config["focus"] * 60);
  };

  const nextSession = () => {
    setTimerMode((m) => {
      if (m === "focus") {
        if (currentSession === config.num_sessions) {
          return "longbreak";
        } else {
          return "break";
        }
      } else {
        if (m === "break") {
          setCurrentSession(currentSession + 1);
        } else {
          setCurrentSession(1);
        }
        return "focus";
      }
    });
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      setCounter(config[timerMode] * 60);
      // if (!timerRunning)
      //   startTimer();
    }
  }, [timerMode]);

  useEffect(() => {
    if (counter === 0) {
      if (config.show_notification) {
        if (timerMode === "focus") {
          Notifier.focus("Take a Break!");
        } else {
          Notifier.focus("Get back to Work!");
        }
      }

      setTimeout(() => {
        nextSession();
      }, 1000);
    }
    document.title = `${getMinutes(counter)}:${getSeconds(counter)} | Pomodoro`;
  }, [counter]);

  useEffect(() => {
    if (timerMode === "focus") {
      setCounter(config.focus * 60);
    } else if (timerMode === "break") {
      setCounter(config.break * 60);
    } else if (timerMode === "longbreak") {
      setCounter(config.longbreak * 60);
    }
  }, [config]);

  return (
    <>
      <div className="timer">
        <CircularProgressbarWithChildren
          value={config[timerMode]*60 - counter}
          maxValue={config[timerMode] * 60}
          strokeWidth={2}
          counterClockwise={false}
          styles={buildStyles({
            textColor: "#2b2c2c",
            pathColor: "#5e5e5e",
            pathTransition: "stroke-dashoffset 1s linear 0s",
          })}
        >
          <div className="timer-display">
            {`${getMinutes(counter)}:${getSeconds(counter)}`}
          </div>
          <div className="mode-display">
            {timerMode === "focus" ? "Focus" : "Break"}
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <div className="timer-controls">
        <button className="control-button" onClick={resetTimer}>
          <BsArrowCounterclockwise className="button-icon" />
        </button>
        {timerRunning ? (
          <button
            className="control-button control-button-main"
            onClick={stopTimer}
          >
            <BsPauseCircle className="button-icon" />
          </button>
        ) : (
          <button
            className="control-button control-button-main"
            onClick={startTimer}
          >
            <BsPlayCircle className="button-icon" />
          </button>
        )}
        <button className="control-button" onClick={nextSession}>
          <BsChevronBarRight className="button-icon" />
        </button>
      </div>

      <div className="toolbar-tray">
        <button
          className="control-button settings-button"
          onClick={() => setShowSettingsDialog(true)}
        >
          <BsFillGearFill className="button-icon" />
        </button>
      </div>

      {showSettingsDialog ? (
        <SettingsDialog
          closeSettingsDialog={() => {
            setShowSettingsDialog(false);
          }}
        />
      ) : null}
    </>
  );
}
