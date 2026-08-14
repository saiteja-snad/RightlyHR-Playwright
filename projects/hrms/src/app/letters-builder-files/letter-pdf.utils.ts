import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from './custom-fonts-vfs';

const DEFAULT_LETTER_LOGO = '/logos/rightlyhr-full-logo.png';

export interface LetterAssetLoaderOptions {
  downloadBlob?: (filePath: string) => Promise<Blob | null>;
  viewUrl?: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function extractBlobFilePath(logoUrl: string, viewUrl?: string): string | null {
  if (!logoUrl || logoUrl.startsWith('/')) {
    return null;
  }

  if (!logoUrl.startsWith('http')) {
    return logoUrl.replace(/^\/+/, '');
  }

  if (viewUrl && logoUrl.startsWith(viewUrl)) {
    return logoUrl.slice(viewUrl.length).replace(/^\/+/, '');
  }

  try {
    const url = new URL(logoUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(1).join('/');
    }
  } catch {
    return null;
  }

  return null;
}

function loadImageWithCanvas(url: string): Promise<string | undefined> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.warn('Canvas logo conversion failed:', error);
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
}

function getBase64FromDomImage(url: string): string | undefined {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('img.company-logo, img.letter-watermark')
  );

  for (const img of images) {
    if (img.src !== url || !img.complete || img.naturalWidth <= 0) {
      continue;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        continue;
      }
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function fetchImageAsBase64(
  url: string,
  options?: LetterAssetLoaderOptions & { allowDefaultFallback?: boolean }
): Promise<string | undefined> {
  if (!url) {
    return undefined;
  }

  const allowDefaultFallback = options?.allowDefaultFallback ?? true;
  const filePath = extractBlobFilePath(url, options?.viewUrl);

  if (filePath && options?.downloadBlob) {
    try {
      const blob = await options.downloadBlob(filePath);
      if (blob) {
        return await blobToDataUrl(blob);
      }
    } catch (error) {
      console.warn('API logo download failed:', filePath, error);
    }
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await blobToDataUrl(await response.blob());
      }
    } catch (error) {
      console.warn('Local logo fetch failed:', url, error);
    }
  }

  const fromCanvas = await loadImageWithCanvas(url);
  if (fromCanvas) {
    return fromCanvas;
  }

  const fromDom = getBase64FromDomImage(url);
  if (fromDom) {
    return fromDom;
  }

  if (allowDefaultFallback && url !== DEFAULT_LETTER_LOGO && !url.endsWith(DEFAULT_LETTER_LOGO)) {
    return fetchImageAsBase64(DEFAULT_LETTER_LOGO, { allowDefaultFallback: false });
  }

  return undefined;
}

export async function getFileBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return null;
  }
}

export interface LetterAssets {
  backgroundImageBase64?: string;
  headerLogoBase64?: string;
}

let letterLogoContext: {
  companyLogo?: string;
  loaderOptions?: LetterAssetLoaderOptions;
} = {};

export function setLetterLogoContext(
  companyLogo: string,
  loaderOptions: LetterAssetLoaderOptions
): void {
  letterLogoContext = { companyLogo, loaderOptions };
}

export async function fetchLetterAssets(
  isSoftCopy: boolean,
  companyLogo?: string,
  loaderOptions?: LetterAssetLoaderOptions
): Promise<LetterAssets> {
  if (!isSoftCopy) {
    return {};
  }

  const resolvedLogo = companyLogo ?? letterLogoContext.companyLogo;
  const resolvedOptions = loaderOptions ?? letterLogoContext.loaderOptions;
  const hasCustomLogo = Boolean(resolvedLogo);
  const logoUrl = resolvedLogo || DEFAULT_LETTER_LOGO;
  const dynamicLogo = await fetchImageAsBase64(logoUrl, {
    ...resolvedOptions,
    allowDefaultFallback: !hasCustomLogo
  });

  return {
    backgroundImageBase64: dynamicLogo,
    headerLogoBase64: dynamicLogo
  };
}

export async function setupLetterPdfMake(): Promise<any> {
  const pm = (pdfMake as any).default ?? pdfMake;
  const [verdanaItalic, verdanaSemiBold] = await Promise.all([
    getFileBase64('/fonts/Verdana Italic.ttf'),
    getFileBase64('/fonts/verdana-pro-semi-bold.ttf'),
  ]);
  const mergedVfs: Record<string, string> = { ...customVfs };
  if (verdanaItalic) mergedVfs['VerdanaItalic.ttf'] = verdanaItalic;
  if (verdanaSemiBold) mergedVfs['VerdanaSemiBold.ttf'] = verdanaSemiBold;
  pm.addVirtualFileSystem(mergedVfs);
  pm.setFonts({
    VERDANA: {
      normal: 'VerdanaNow.ttf',
      bold: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
      italics: verdanaItalic ? 'VerdanaItalic.ttf' : 'VerdanaNow.ttf',
      bolditalics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
    },
    VERDANABOLD: {
      normal: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
      bold: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
      italics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
      bolditalics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf',
    },
    Autography: {
      normal: 'Autography.otf',
      bold: 'Autography.otf',
      italics: 'Autography.otf',
      bolditalics: 'Autography.otf',
    },
  });
  return pm;
}
