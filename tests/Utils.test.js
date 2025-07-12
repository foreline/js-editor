import { Utils } from '@/Utils.js';

describe('Utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('stripTagsAttributes method', () => {
    test('should remove attributes from HTML tags', () => {
      const input = '<div class="test" id="test">Content</div>';
      const expected = '<div>Content</div>';
      
      const result = Utils.stripTagsAttributes(input);
      expect(result).toBe(expected);
    });

    test('should handle multiple tags', () => {
      const input = '<p class="para">Text with <span style="color:red">styled</span> content</p>';
      const expected = '<p>Text with <span>styled</span> content</p>';
      
      const result = Utils.stripTagsAttributes(input);
      expect(result).toBe(expected);
    });

    test('should handle empty string', () => {
      const input = '';
      const expected = '';
      
      const result = Utils.stripTagsAttributes(input);
      expect(result).toBe(expected);
    });
  });

  describe('stripTags method', () => {
    test('should remove all HTML tags', () => {
      const input = '<p>This is <b>bold</b> text</p>';
      const expected = 'This is bold text';
      
      const result = Utils.stripTags(input);
      expect(result).toBe(expected);
    });

    test('should allow specified tags', () => {
      const input = '<p>This is <b>bold</b> and <i>italic</i> text</p>';
      const expected = 'This is <b>bold</b> and <i>italic</i> text';
      
      const result = Utils.stripTags(input, '<b><i>');
      expect(result).toBe(expected);
    });

    test('should handle empty string', () => {
      const input = '';
      const expected = '';
      
      const result = Utils.stripTags(input);
      expect(result).toBe(expected);
    });
  });

  describe('escapeHTML method', () => {
    test('should escape HTML special characters', () => {
      const input = '<div>Test & "quote" \'single\' </div>';
      const expected = '&lt;div&gt;Test &amp; &quot;quote&quot; &#039;single&#039; &lt;/div&gt;';
      
      const result = Utils.escapeHTML(input);
      expect(result).toBe(expected);
    });

    test('should handle empty string', () => {
      const input = '';
      const expected = '';
      
      const result = Utils.escapeHTML(input);
      expect(result).toBe(expected);
    });
  });
});
