import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from './custom-fonts-vfs';

export function fetchImageAsBase64(url: string): Promise<string> {
  return fetch(url).then(res => res.blob()).then(blob => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  }));
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

export async function fetchLetterAssets(isSoftCopy: boolean): Promise<LetterAssets> {
  if (!isSoftCopy) return {};
  const [backgroundImageBase64, headerLogoBase64] = await Promise.all([
    fetchImageAsBase64('/images/water-mark.png'),
    fetchImageAsBase64('/logos/rightlyhr-full-logo.png'),
  ]);
  return { backgroundImageBase64, headerLogoBase64 };
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
