const PREFIX = "component.bindhome.panel.";

export async function loadPanelTranslations(hass, language) {
  const fetch = async (requestedLanguage) => {
    const response = await hass.callWS({
      type: "frontend/get_translations",
      language: requestedLanguage,
      category: "panel",
      integration: ["bindhome"],
    });
    return response?.resources ?? {};
  };
  const english = await fetch("en");
  let localized = english;
  if (language !== "en") {
    try { localized = await fetch(language); }
    catch { localized = english; }
  }
  return createLocalizer(localized, english);
}

export function createLocalizer(resources = {}, english = {}) {
  return (key, variables = {}) => {
    const resourceKey = `${PREFIX}${key}`;
    const template = resources[resourceKey] ?? english[resourceKey] ?? key;
    return template.replace(/\{(\w+)\}/g, (match, name) => variables[name] ?? match);
  };
}

export function pluralKey(key, count) {
  return `${key}.${count === 1 ? "one" : "other"}`;
}

export function presetDisplayName(t, preset) {
  const key = `presets.${preset.preset_id}.name`;
  const translated = t(key);
  return translated === key ? preset.default_name : translated;
}
