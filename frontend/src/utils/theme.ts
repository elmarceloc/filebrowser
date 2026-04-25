import { theme } from "./constants";
import "ace-builds";
import { themesByName } from "ace-builds/src-noconflict/ext-themelist";

export const getTheme = (): UserTheme => {
  const savedTheme = localStorage.getItem("theme") as UserTheme;
  if (savedTheme) {
    return savedTheme;
  }
  return (document.documentElement.className as UserTheme) || theme;
};

export const setTheme = (theme: UserTheme) => {
  const html = document.documentElement;
  if (!theme) {
    const preference = getMediaPreference();
    html.className = preference;
    localStorage.setItem("theme", preference);
  } else {
    html.className = theme;
    localStorage.setItem("theme", theme);
  }
};

export const toggleTheme = (): void => {
  const activeTheme = getTheme();
  const newTheme = activeTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
};

export const getMediaPreference = (): UserTheme => {
  const hasDarkPreference = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (hasDarkPreference) {
    return "dark";
  } else {
    return "light";
  }
};

export const getEditorTheme = (themeName: string) => {
  if (!themeName.startsWith("ace/theme/")) {
    themeName = `ace/theme/${themeName}`;
  }
  const themeKey = themeName.replace("ace/theme/", "");
  if (themesByName[themeKey] !== undefined) {
    return themeName;
  } else if (getTheme() === "dark") {
    return "ace/theme/twilight";
  } else {
    return "ace/theme/chrome";
  }
};
