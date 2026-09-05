/**
 * Register one BindHome custom element without failing when the panel bundle is
 * evaluated again in the same browser tab.
 *
 * The browser CustomElementRegistry is global for the page and keeps the first
 * constructor registered for a name. A cache-busted or reloaded BindHome bundle
 * must therefore reuse that definition instead of calling define() again.
 *
 * @param {string} name
 * @param {CustomElementConstructor} constructor
 * @param {CustomElementRegistry} [registry]
 * @returns {CustomElementConstructor}
 */
export function defineBindHomeElement(
  name,
  constructor,
  registry = customElements,
) {
  const existing = registry.get(name);
  if (existing) return existing;

  registry.define(name, constructor);
  return constructor;
}
