window.FileBrowser = window.FileBrowser || {};

const name: string = window.FileBrowser.Name || "File Browser";
const disableExternal: boolean = window.FileBrowser.DisableExternal || false;
const disableUsedPercentage: boolean =
  window.FileBrowser.DisableUsedPercentage || false;
const baseURL: string = window.FileBrowser.BaseURL || "";
const staticURL: string = window.FileBrowser.StaticURL || "";
const recaptcha: string = window.FileBrowser.ReCaptcha || false;
const recaptchaKey: string = window.FileBrowser.ReCaptchaKey || "";
const signup: boolean = window.FileBrowser.Signup || false;
const version: string = window.FileBrowser.Version || "(untracked)";
const logoURL = `${staticURL}/img/logo.svg`;
const noAuth: boolean = window.FileBrowser.NoAuth || false;
const authMethod = window.FileBrowser.AuthMethod || "json";
const logoutPage: string = window.FileBrowser.LogoutPage || "";
const loginPage: boolean = window.FileBrowser.LoginPage || true;
const theme: UserTheme = window.FileBrowser.Theme || "";
const enableThumbs: boolean = window.FileBrowser.EnableThumbs || true;
const resizePreview: boolean = window.FileBrowser.ResizePreview || true;
const enableExec: boolean = window.FileBrowser.EnableExec || true;
const tusSettings = window.FileBrowser.TusSettings || {
  chunkSize: 10485760,
  retryCount: 5,
};
const origin = window.location.origin;
const tusEndpoint = `/api/tus`;
const hideLoginButton = window.FileBrowser.HideLoginButton || false;

export {
  name,
  disableExternal,
  disableUsedPercentage,
  baseURL,
  logoURL,
  recaptcha,
  recaptchaKey,
  signup,
  version,
  noAuth,
  authMethod,
  logoutPage,
  loginPage,
  theme,
  enableThumbs,
  resizePreview,
  enableExec,
  tusSettings,
  origin,
  tusEndpoint,
  hideLoginButton,
};
