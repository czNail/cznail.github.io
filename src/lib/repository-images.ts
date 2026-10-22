/** The same local asset is used for a repository in every homepage section. */
export function setRepositoryImage(container: Element, source?: string) {
  container.querySelectorAll('img[data-repository-image]').forEach(image => image.remove());
  container.removeAttribute('data-has-image');
  if (!source) return;
  const image = document.createElement('img');
  image.src = source; image.alt = ''; image.decoding = 'async'; image.dataset.repositoryImage = '';
  container.setAttribute('data-has-image','true');
  container.append(image);
}
export function startImageFallbacks() {
  const restore = (image: HTMLImageElement) => {
    if (!image.matches('[data-repository-image]')) return;
    if (image.getAttribute('src') !== '/project-icons/default.svg') {
      image.src = '/project-icons/default.svg'; return;
    }
    image.parentElement?.removeAttribute('data-has-image'); image.remove();
  };
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) restore(event.target);
  }, true);
  document.querySelectorAll<HTMLImageElement>('[data-repository-image]').forEach(image => {
    if (image.complete && !image.naturalWidth) restore(image);
  });
}
