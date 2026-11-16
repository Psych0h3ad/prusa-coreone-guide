// Each edition opens its own document and keeps its own assembly progress.
// The caller supplies only editions whose complete entry pages are available.
export function mountEditionSelector({mount, current, editions, baseURL = document.baseURI}) {
  if (!mount || !Array.isArray(editions) || editions.length < 2) return null;
  if (mount.querySelector('[data-edition-selector]')) throw Error('Edition selector already mounted');
  const ids = new Set();
  const routes = new Map(editions.map(edition => {
    if (!edition.id || ids.has(edition.id) || !edition.label || typeof edition.href !== 'string' || !edition.href) throw Error('Invalid edition');
    ids.add(edition.id);
    const url = new URL(edition.href, baseURL);
    if (url.origin !== new URL(baseURL).origin) throw Error('Edition entry must use the same origin');
    return [edition.id, url];
  }));
  if (!routes.has(current)) throw Error('Current edition has no entry page');

  const label = document.createElement('label');
  label.className = 'edition-selector';
  label.dataset.editionSelector = '';
  const caption = document.createElement('span');
  caption.className = 'edition-selector-label';
  caption.textContent = '機種';
  const select = document.createElement('select');
  select.setAttribute('aria-label', '組み立てる機種を選ぶ');
  select.setAttribute('data-no-translate', '');
  for (const edition of editions) {
    const option = document.createElement('option');
    option.value = edition.id;
    option.textContent = edition.label;
    select.append(option);
  }
  select.value = current;
  const change = () => {
    const route = routes.get(select.value);
    if (!route || select.value === current) return;
    const target = new URL(route.href);
    const language = document.documentElement.lang;
    if (['ja', 'en', 'cs', 'de'].includes(language) && !target.searchParams.has('lang')) {
      target.searchParams.set('lang', language);
    }
    location.assign(target.href);
  };
  // BFCache may restore a page after changing the select. Keep its displayed
  // choice aligned with this document's edition when navigating back.
  const restore = () => { select.value = current; };
  select.addEventListener('change', change);
  window.addEventListener('pageshow', restore);
  label.append(caption, select);
  mount.prepend(label);
  const header = mount.closest('.header');
  header?.classList.add('has-edition-selector');
  const singleLanguage = editions.find(edition => edition.id === current)?.languages?.length === 1;
  if (singleLanguage) header?.classList.add('edition-single-language');
  return {
    element: label,
    dispose() {
      select.removeEventListener('change', change);
      window.removeEventListener('pageshow', restore);
      label.remove();
      if (!header?.querySelector('[data-edition-selector]')) header?.classList.remove('has-edition-selector', 'edition-single-language');
    }
  };
}
