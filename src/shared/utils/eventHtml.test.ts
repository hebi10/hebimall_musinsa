import { sanitizeEventHtml } from './eventHtml';

describe('sanitizeEventHtml', () => {
  test('removes scripts, event handlers, dangerous urls, and disallowed tags', () => {
    const html = [
      '<h2 onclick="alert(1)">혜택 안내</h2>',
      '<p>정상 문장 <strong>강조</strong></p>',
      '<a href="javascript:alert(1)">위험 링크</a>',
      '<img src="x" onerror="alert(1)" />',
      '<iframe src="https://evil.example"></iframe>',
      '<script>alert(1)</script>',
    ].join('');

    expect(sanitizeEventHtml(html)).toBe(
      '<h2>혜택 안내</h2><p>정상 문장 <strong>강조</strong></p><a>위험 링크</a>',
    );
  });

  test('keeps a small allowlist used by event content', () => {
    const html = '<h3>참여 방법</h3><ul><li>로그인</li><li>쿠폰 등록</li></ul>';

    expect(sanitizeEventHtml(html)).toBe(html);
  });
});
