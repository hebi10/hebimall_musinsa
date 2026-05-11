export const IMAGE_OPTIMIZATION = {
  outputMimeType: 'image/webp',
  quality: 0.75,
  extension: 'webp',
} as const;

export const getOptimizedWebpFileName = (fileName: string): string => {
  const trimmedName = fileName.trim() || 'image';
  const lastDotIndex = trimmedName.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return `${trimmedName}.webp`;
  }

  return `${trimmedName.slice(0, lastDotIndex)}.webp`;
};

export const getOptimizedWebpStorageFileName = (
  fileName: string,
  prefix?: string | number
): string => {
  const webpFileName = getOptimizedWebpFileName(fileName);
  const baseName = webpFileName.slice(0, -'.webp'.length);
  const normalizedPrefix = prefix === undefined || prefix === '' ? '' : `${prefix}_`;

  return `${normalizedPrefix}${baseName}_q75.webp`;
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    image.src = url;
  });
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('이미지 WebP 변환에 실패했습니다.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality
    );
  });
};

export const optimizeImageForUpload = async (file: File): Promise<File> => {
  const previewUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(previewUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('이미지 변환 컨텍스트를 생성하지 못했습니다.');
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(
      canvas,
      IMAGE_OPTIMIZATION.outputMimeType,
      IMAGE_OPTIMIZATION.quality
    );

    return new File([blob], getOptimizedWebpFileName(file.name), {
      type: IMAGE_OPTIMIZATION.outputMimeType,
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
};
