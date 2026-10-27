// Run before styles paint. This preference contains only the color-theme enum,
// never session, conversation or draft data.
(() => {
  const key = "nanoduck-color-theme-v1";
  const root = document.documentElement;
  let storage;
  let theme = "dark";
  const apply = value => {
    theme = value === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
    const mark = theme === "light" ? "/nanoduck-original.svg" : "/nanoduck.svg";
    document.querySelector('link[rel="icon"]')?.setAttribute("href", mark);
    for (const image of document.querySelectorAll(".brand img,.brand-lockup img")) image.setAttribute("src", mark);
    for (const control of document.querySelectorAll("[data-theme-toggle]")) {
      control.setAttribute("aria-checked", String(theme === "light"));
    }
  };
  try { storage = window.localStorage; apply(storage.getItem(key)); } catch { apply("dark"); }

  const connect = () => {
    apply(theme);
    for (const control of document.querySelectorAll("[data-theme-toggle]")) {
      control.addEventListener("click", () => {
        apply(theme === "light" ? "dark" : "light");
        try { storage?.setItem(key, theme); } catch { /* The page can still switch when storage is blocked. */ }
      });
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", connect, { once: true });
  else connect();
  window.addEventListener("storage", event => {
    if (storage && event.storageArea === storage && (event.key === key || event.key === null)) apply(event.newValue);
  });
})();
