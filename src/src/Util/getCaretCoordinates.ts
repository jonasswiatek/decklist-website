const MIRROR_PROPERTIES = [
  'direction', 'boxSizing', 'width',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
  'fontSizeAdjust', 'lineHeight', 'fontFamily',
  'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing',
  'tabSize',
  'whiteSpace', 'wordWrap', 'wordBreak',
] as const;

export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const div = document.createElement('div');
  const computed = getComputedStyle(element);

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.overflow = 'hidden';

  for (const prop of MIRROR_PROPERTIES) {
    (div.style as unknown as Record<string, string>)[prop] = (computed as unknown as Record<string, string>)[prop];
  }

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = '\u200b';
  div.appendChild(span);

  document.body.appendChild(div);

  const coordinates = {
    top: span.offsetTop - element.scrollTop,
    left: span.offsetLeft,
  };

  document.body.removeChild(div);

  return coordinates;
}
