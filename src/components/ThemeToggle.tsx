"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  .theme-switch {
    --toggle-size: 18px;
    --container-light-bg: #3d7eae;
    --container-night-bg: #4f266a;
    --circle-container-diameter: 3.5em;
    --sun-moon-diameter: 2.5em;
    --sun-bg: #ffd141;
    --moon-bg: #cbcbcb;
    --spot-color: #a6a6a6;
    --circle-container-offset: calc((var(--circle-container-diameter) - var(--sun-moon-diameter)) / 2);
    --stars-color: #fff;
    --clouds-color: #f4f4f4;
    --back-clouds-color: #ffffff;
    --transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
    --circle-transition: 0.3s cubic-bezier(0, -0.02, 0.35, 1.17);
  }

  .theme-switch,
  .theme-switch *,
  .theme-switch *::before,
  .theme-switch *::after {
    box-sizing: border-box;
  }

  .theme-switch__container {
    width: 5em;
    height: 2.5em;
    background-color: var(--container-light-bg);
    border-radius: 9999px;
    overflow: hidden;
    cursor: pointer;
    -webkit-box-shadow: 0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
      0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    box-shadow: 0em -0.062em 0.062em rgba(0, 0, 0, 0.25), 0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    transition: var(--transition);
    position: relative;
    font-size: var(--toggle-size);
  }

  .theme-switch__container::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    box-shadow: 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset,
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
    border-radius: 9999px;
  }

  .theme-switch__checkbox {
    display: none;
  }

  .theme-switch__circle-container {
    width: var(--circle-container-diameter);
    height: var(--circle-container-diameter);
    background-color: rgba(255, 255, 255, 0.1);
    position: absolute;
    left: var(--circle-container-offset);
    top: var(--circle-container-offset);
    border-radius: 9999px;
    box-shadow: inset 0 0 0 3.375em rgba(255, 255, 255, 0.1), inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      0 0 0 0.625em rgba(255, 255, 255, 0.1), 0 0 0 1.25em rgba(255, 255, 255, 0.1);
    display: flex;
    transition: var(--circle-transition);
    pointer-events: none;
  }

  .theme-switch__sun-moon-container {
    pointer-events: auto;
    position: relative;
    z-index: 2;
    width: var(--sun-moon-diameter);
    height: var(--sun-moon-diameter);
    margin: auto;
    border-radius: 9999px;
    background-color: var(--sun-bg);
    box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset,
      0em -0.062em 0.062em 0em #a1872a inset;
    filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25));
    overflow: hidden;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-switch__aji {
    width: 82%;
    height: 82%;
    object-fit: contain;
    transition: var(--transition);
  }

  .moon {
    transform: translateX(100%);
    filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25));
  }

  .spot {
    position: absolute;
    top: 0.75em;
    left: 0.312em;
    width: 0.75em;
    height: 0.75em;
    border-radius: 9999px;
    background-color: var(--spot-color);
    box-shadow: 0em 0.062em 0.062em rgba(0, 0, 0, 0.25) inset;
  }

  .spot:nth-of-type(2) {
    width: 0.375em;
    height: 0.375em;
    top: 0.937em;
    left: 1.375em;
  }

  .spot:nth-of-type(3) {
    width: 0.25em;
    height: 0.25em;
    top: 0.312em;
    left: 0.937em;
  }

  .clouds {
    width: 2.5em;
    height: 2.5em;
    background-color: var(--clouds-color);
    border-radius: 9999px;
    position: absolute;
    bottom: -1.25em;
    left: 0.312em;
    transition: var(--transition);
    overflow: visible;
  }

  .clouds::before,
  .clouds::after {
    content: "";
    display: block;
    position: absolute;
    background-color: var(--clouds-color);
    border-radius: 9999px;
  }

  .clouds::before {
    width: 1.25em;
    height: 1.25em;
    top: -0.312em;
    left: -1.125em;
  }

  .clouds::after {
    width: 0.812em;
    height: 0.812em;
    top: -0.5em;
    left: 0.5em;
  }

  .stars {
    transform: translateY(-100%);
    transition: var(--transition);
  }

  .star {
    fill: var(--stars-color);
    position: absolute;
  }

  .star:nth-of-type(1) {
    width: 0.687em;
    top: 0.25em;
    left: 1.75em;
  }

  .star:nth-of-type(2) {
    width: 0.312em;
    top: 1em;
    left: 1.25em;
  }

  .star:nth-of-type(3) {
    width: 0.5em;
    top: 1.5em;
    left: 2.25em;
  }

  .theme-switch__checkbox:checked + .theme-switch__container {
    background-color: var(--container-night-bg);
  }

  .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container {
    left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter));
  }

  .theme-switch__checkbox:checked + .theme-switch__container .sun-moon {
    background-color: var(--moon-bg);
  }

  .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__aji {
    opacity: 0;
    transform: scale(0.4);
  }

  .theme-switch__checkbox:checked + .theme-switch__container .stars {
    transform: translateY(0);
  }

  .theme-switch__checkbox:checked + .theme-switch__container .clouds {
    transform: translateY(100%);
  }
`;

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  if (!mounted) {
    return <div className="w-[5em] h-[2.5em]" style={{ fontSize: 18 }} aria-hidden />;
  }

  return (
    <StyledWrapper>
      <label className="theme-switch" aria-label="Cambiar tema claro u oscuro">
        <input
          type="checkbox"
          className="theme-switch__checkbox"
          checked={isDark}
          onChange={toggle}
        />
        <div className="theme-switch__container">
          <div className="theme-switch__circle-container">
            <div className="theme-switch__sun-moon-container sun-moon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/icono.png" alt="" className="theme-switch__aji" />
              <div className="moon">
                <div className="spot" />
                <div className="spot" />
                <div className="spot" />
              </div>
            </div>
          </div>
          <div className="stars">
            <svg viewBox="0 0 20 20" className="star star-1">
              <path d="M10 0l2.5 7.5H20l-6 4.5 2.5 7.5-6.5-4.5L3.5 19.5 6 12 0 7.5h7.5z" />
            </svg>
            <svg viewBox="0 0 20 20" className="star star-2">
              <path d="M10 0l2.5 7.5H20l-6 4.5 2.5 7.5-6.5-4.5L3.5 19.5 6 12 0 7.5h7.5z" />
            </svg>
            <svg viewBox="0 0 20 20" className="star star-3">
              <path d="M10 0l2.5 7.5H20l-6 4.5 2.5 7.5-6.5-4.5L3.5 19.5 6 12 0 7.5h7.5z" />
            </svg>
          </div>
          <div className="clouds" />
        </div>
      </label>
    </StyledWrapper>
  );
}
