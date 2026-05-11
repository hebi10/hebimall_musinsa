import {
  IMAGE_OPTIMIZATION,
  getOptimizedWebpFileName,
  getOptimizedWebpStorageFileName,
} from './imageOptimization';

describe('imageOptimization', () => {
  test('uses WebP quality 75 for product upload optimization', () => {
    expect(IMAGE_OPTIMIZATION.outputMimeType).toBe('image/webp');
    expect(IMAGE_OPTIMIZATION.quality).toBe(0.75);
  });

  test('normalizes uploaded image names to .webp', () => {
    expect(getOptimizedWebpFileName('photo.JPG')).toBe('photo.webp');
    expect(getOptimizedWebpFileName('look.book.png')).toBe('look.book.webp');
    expect(getOptimizedWebpFileName('image')).toBe('image.webp');
  });

  test('builds q75 WebP storage names', () => {
    expect(getOptimizedWebpStorageFileName('photo.JPG')).toBe('photo_q75.webp');
    expect(getOptimizedWebpStorageFileName('look.book.png', '177849')).toBe('177849_look.book_q75.webp');
  });
});
