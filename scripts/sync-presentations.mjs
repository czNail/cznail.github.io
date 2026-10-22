import { Buffer } from 'node:buffer';
import { extname } from 'node:path';
import { normalizePresentation } from '../src/lib/presentation.mjs';
import { owner } from '../src/lib/catalog.mjs';

function decode(file, maximum) {
  if (!file || file.type !== 'file' || file.encoding !== 'base64' || typeof file.content !== 'string' || file.size > maximum) throw Error('Invalid repository file');
  const bytes = Buffer.from(file.content, 'base64');
  if (!bytes.length || bytes.length > maximum) throw Error('Repository file exceeds limit');
  return bytes;
}
function checkImage(bytes, extension) {
  if (extension === '.svg') {
    const source = bytes.toString('utf8');
    if (!/<svg[\s>]/i.test(source) || /<script|<foreignObject|<!ENTITY|<!DOCTYPE|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|url\s*\(\s*["']?(?!#)[^\s"')]/i.test(source)) throw Error('Unsupported SVG');
  } else if (extension === '.png') {
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('Invalid PNG');
  } else if (extension === '.webp') {
    if (bytes.toString('ascii',0,4) !== 'RIFF' || bytes.toString('ascii',8,12) !== 'WEBP') throw Error('Invalid WebP');
  } else if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) throw Error('Invalid JPEG');
}
/** Sync at build time only; browsers use the validated local snapshot and assets.
 * @param {import('../src/lib/catalog.mjs').Repository[]} repositories
 * @param {(path:string)=>Promise<any>} request
 * @param {(filename:string,bytes:Buffer)=>Promise<void>} saveAsset
 */
export async function syncPresentations(repositories, request, saveAsset) {
  for (const repo of repositories) {
    const previous = repo.presentation;
    const ref = encodeURIComponent(repo.revision || repo.defaultBranch || 'HEAD');
    const contents = path => `/repos/${owner}/${encodeURIComponent(repo.name)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`;
    let data;
    try {
      data = JSON.parse(decode(await request(contents('homepage.json')), 32 * 1024).toString('utf8'));
    } catch (error) {
      repo.presentation = error.status === 404 ? null : previous ?? null;
      continue;
    }
    try {
      const {iconPath, ...presentation} = normalizePresentation(data);
      if (iconPath) {
        try {
          const file = await request(contents(iconPath));
          const bytes = decode(file, 512 * 1024);
          const extension = extname(iconPath).toLowerCase();
          checkImage(bytes, extension);
          if (!/^[a-f0-9]{40,64}$/i.test(file.sha)) throw Error('Invalid blob hash');
          const filename = `${repo.name.toLowerCase()}-${file.sha}${extension}`;
          await saveAsset(filename, bytes);
          presentation.image = `/project-icons/${filename}`;
        } catch (error) {
          // An explicit deletion clears the icon; a temporary failure keeps the last icon.
          if (error.status !== 404 && previous?.image) presentation.image = previous.image;
        }
      }
      repo.presentation = presentation;
    } catch { repo.presentation = previous ?? null; }
  }
}
