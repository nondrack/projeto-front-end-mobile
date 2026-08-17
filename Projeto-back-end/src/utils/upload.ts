import fs from 'fs';
import path from 'path';

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function validateImageFile(file?: { originalname?: string; mimetype?: string; size?: number }) {
  if (!file) {
    return new Error('Arquivo de imagem não informado.');
  }

  const extension = path.extname(file.originalname ?? '').toLowerCase();
  const mime = String(file.mimetype ?? '').toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension) && !ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
    return new Error('Formato inválido. Envie apenas arquivos JPG, PNG ou WEBP.');
  }

  if ((file.size ?? 0) > MAX_IMAGE_SIZE) {
    return new Error('Arquivo muito grande. O tamanho máximo permitido é 2MB.');
  }

  return null;
}

export function buildSafeFilename(originalName: string, directory = 'uploads') {
  const safeName = String(originalName ?? '').trim();
  if (!safeName) {
    return 'upload';
  }

  const ext = path.extname(safeName).toLowerCase();
  const base = path.basename(safeName, ext).replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').toLowerCase() || 'upload';
  const fullPath = path.join(directory, `${base}${ext}`);

  if (!fs.existsSync(fullPath)) {
    return `${base}${ext}`;
  }

  let counter = 1;
  let candidate = fullPath;

  while (fs.existsSync(candidate)) {
    const nextName = `${base}-${counter}${ext}`;
    candidate = path.join(directory, nextName);
    counter += 1;
  }

  return path.basename(candidate);
}
