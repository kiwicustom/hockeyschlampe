(() => {
  const I18N = window.HS_I18N;
  if (!I18N) return;

  const STORAGE_KEY = "hs.entry.lang";
  const htmlLang = { de: "de", en: "en", fi: "fi", fr: "fr", it: "it", gsw: "gsw" };

  function detectLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && I18N.strings[saved]) return saved;
    } catch {
      /* ignore */
    }
    const nav = (navigator.languages || [navigator.language || ""]).map((l) =>
      String(l).toLowerCase()
    );
    for (const l of nav) {
      if (l.startsWith("de-ch") || l === "gsw") return "gsw";
      if (l.startsWith("de")) return "de";
      if (l.startsWith("en")) return "en";
      if (l.startsWith("fi")) return "fi";
      if (l.startsWith("fr")) return "fr";
      if (l.startsWith("it")) return "it";
    }
    return I18N.defaultLang;
  }

  function t(lang, key) {
    return I18N.strings[lang]?.[key] ?? I18N.strings[I18N.defaultLang]?.[key] ?? key;
  }

  function setMeta(name, content, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function apply(lang) {
    const dict = I18N.strings[lang] || I18N.strings[I18N.defaultLang];
    document.documentElement.lang = htmlLang[lang] || lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key || dict[key] == null) return;
      if (el.tagName === "TITLE") {
        el.textContent = dict[key];
        return;
      }
      el.textContent = dict[key];
    });

    document.title = t(lang, "meta.title");
    setMeta("description", t(lang, "meta.description"));
    setMeta("og:title", t(lang, "meta.ogTitle"), "property");
    setMeta("og:description", t(lang, "meta.ogDescription"), "property");
    setMeta("twitter:title", t(lang, "meta.ogTitle"));
    setMeta("twitter:description", t(lang, "meta.ogDescription"));

    const ogLocale = {
      de: "de_CH",
      en: "en_CH",
      fi: "fi_FI",
      fr: "fr_CH",
      it: "it_CH",
      gsw: "gsw_CH"
    };
    setMeta("og:locale", ogLocale[lang] || "de_CH", "property");

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      const on = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key && dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }

  function buildSwitcher(current) {
    const wrap = document.getElementById("lang-switch");
    if (!wrap) return;
    wrap.innerHTML = "";
    const label = document.createElement("span");
    label.className = "lang-switch__label";
    label.setAttribute("data-i18n", "lang.label");
    label.textContent = t(current, "lang.label");
    wrap.appendChild(label);

    const group = document.createElement("div");
    group.className = "lang-switch__group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", t(current, "lang.label"));

    I18N.langs.forEach(({ code, label: name }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang-switch__btn";
      btn.setAttribute("data-lang", code);
      btn.textContent = name;
      btn.addEventListener("click", () => apply(code));
      group.appendChild(btn);
    });
    wrap.appendChild(group);
  }

  const lang = detectLang();
  buildSwitcher(lang);
  apply(lang);
})();
