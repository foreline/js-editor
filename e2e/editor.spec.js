import { test, expect } from '@playwright/test';

test.describe('JS Editor Basic Functionality', () => {
  test('should load the editor', async ({ page }) => {
    await page.goto('/');
    
    // Wait for editor content area to be present (use .editor-content which should be unique)
    const editorContent = page.locator('.editor-content, #editor-content').first();
    await expect(editorContent).toBeVisible();
    
    // Check for toolbar
    const toolbar = page.locator('.editor-toolbar');
    await expect(toolbar).toBeVisible();
  });

  test('should allow typing text', async ({ page }) => {
    await page.goto('/');
    
    // Find the editable content area
    const block = page.locator('[contenteditable="true"]').first();
    await block.click();
    await block.type('Hello World!');
    
    // Verify text was entered
    await expect(block).toContainText('Hello World!');
  });

  test('should convert markdown heading trigger', async ({ page }) => {
    await page.goto('/');
    
    // Type heading markdown trigger
    const block = page.locator('[contenteditable="true"]').first();
    await block.click();
    await block.type('# Heading 1');
    await page.keyboard.press('Space');
    
    // Verify it converted to H1 block
    const h1Block = page.locator('.block-h1');
    await expect(h1Block).toBeVisible();
  });

  test('should create new block on Enter', async ({ page }) => {
    await page.goto('/');
    
    // Type in first block
    const firstBlock = page.locator('[contenteditable="true"]').first();
    await firstBlock.click();
    await firstBlock.fill(''); // Clear any existing content
    await page.keyboard.type('First paragraph');
    await page.keyboard.press('Enter');
    
    // Type in second block
    await page.keyboard.type('Second paragraph');
    
    // Verify two blocks exist (or more with initial content)
    const blocks = page.locator('.block');
    const blockCount = await blocks.count();
    expect(blockCount).toBeGreaterThanOrEqual(2);
  });

  test('should apply bold formatting', async ({ page }) => {
    await page.goto('/');
    
    // Type some text
    const block = page.locator('[contenteditable="true"]').first();
    await block.click();
    await block.fill(''); // Clear any existing content
    await page.keyboard.type('Bold text here');
    
    // Select all text
    await page.keyboard.press('Control+A');
    
    // Find and click bold button (handle different possible selectors)
    const boldButton = page.locator('.editor-toolbar-bold, button[title*="bold" i], button[title*="жирный" i]').first();
    await boldButton.click({ timeout: 2000 });
    
    // Wait a bit for formatting to apply
    await page.waitForTimeout(500);
    
    // Verify bold tag exists
    const boldText = block.locator('strong, b');
    await expect(boldText).toBeVisible();
  });

  test('should convert to markdown', async ({ page }) => {
    await page.goto('/');
    
    // Type some content
    const block = page.locator('[contenteditable="true"]').first();
    await block.click();
    await block.type('Test content');
    
    // Get markdown via editor instance
    const markdown = await page.evaluate(() => {
      return window.editor.getMarkdown();
    });
    
    expect(markdown).toContain('Test content');
  });

  test('should convert to HTML', async ({ page }) => {
    await page.goto('/');
    
    // Type some content
    const block = page.locator('[contenteditable="true"]').first();
    await block.click();
    await block.type('Test HTML');
    
    // Get HTML via editor instance
    const html = await page.evaluate(() => {
      return window.editor.getHtml();
    });
    
    expect(html).toContain('Test HTML');
    expect(html).toContain('<p>');
  });
});
