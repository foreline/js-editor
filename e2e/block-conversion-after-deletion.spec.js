import { test, expect } from '@playwright/test';

/**
 * JS Editor — Block Conversion After All Blocks Deletion
 * 
 * Tests the fix for the issue where block styling is applied to the wrong block
 * after deleting all blocks and creating a new one.
 * 
 * Issue: When all blocks are deleted (Ctrl+A + Backspace), only one block remains.
 * When user presses Enter to create a new block and then tries to convert it
 * (e.g., to H1, H2, H3), the styling was applied to the first block instead of the second.
 */
test.describe('JS Editor — Block Conversion After Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-page.html');
    await page.waitForFunction(() => window.editorReady === true, { timeout: 10000 });
  });

  test('should convert the correct block after deleting all blocks', async ({ page }) => {
    // Step 1: Type some initial content
    const firstBlock = page.locator('[contenteditable="true"]').first();
    await firstBlock.click();
    await page.keyboard.type('Initial content');
    
    // Step 2: Select all (Ctrl+A) and delete (Backspace)
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    
    // Wait for default block to be created
    await page.waitForTimeout(300);
    
    // Step 3: Verify only one block remains
    const blocksAfterDeletion = await page.locator('.block').count();
    expect(blocksAfterDeletion).toBe(1);
    
    // Step 4: Press Enter to create a second block
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    // Step 5: Type some text in the second block
    await page.keyboard.type('Second block content');
    
    // Step 6: Verify we now have 2 blocks
    const blocksAfterEnter = await page.locator('.block').count();
    expect(blocksAfterEnter).toBe(2);
    
    // Step 7: Click the H1 button to convert the second (current) block
    const h1Button = page.locator('.editor-toolbar-header1');
    await h1Button.click();
    
    // Wait for conversion to complete
    await page.waitForTimeout(300);
    
    // Step 8: Verify that the SECOND block (not the first) is now an H1
    const blocks = page.locator('.block');
    const firstBlockType = await blocks.nth(0).getAttribute('data-block-type');
    const secondBlockType = await blocks.nth(1).getAttribute('data-block-type');
    
    // First block should still be a paragraph
    expect(firstBlockType).toBe('paragraph');
    
    // Second block should be H1 (this was the bug - it was converting the first block instead)
    expect(secondBlockType).toBe('h1');
    
    // Verify the content is in the right block
    await expect(blocks.nth(1)).toContainText('Second block content');
    
    // Verify the H1 element exists in the second block
    const h1Element = blocks.nth(1).locator('h1');
    await expect(h1Element).toBeVisible();
    await expect(h1Element).toContainText('Second block content');
  });

  test('should convert to H2 after deleting all blocks', async ({ page }) => {
    // Similar test but for H2
    const firstBlock = page.locator('[contenteditable="true"]').first();
    await firstBlock.click();
    await page.keyboard.type('Test content');
    
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.type('H2 content');
    
    const h2Button = page.locator('.editor-toolbar-header2');
    await h2Button.click();
    await page.waitForTimeout(300);
    
    const blocks = page.locator('.block');
    const secondBlockType = await blocks.nth(1).getAttribute('data-block-type');
    expect(secondBlockType).toBe('h2');
    
    const h2Element = blocks.nth(1).locator('h2');
    await expect(h2Element).toBeVisible();
    await expect(h2Element).toContainText('H2 content');
  });

  test('should convert to H3 after deleting all blocks', async ({ page }) => {
    // Similar test but for H3
    const firstBlock = page.locator('[contenteditable="true"]').first();
    await firstBlock.click();
    await page.keyboard.type('Test content');
    
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.type('H3 content');
    
    const h3Button = page.locator('.editor-toolbar-header3');
    await h3Button.click();
    await page.waitForTimeout(300);
    
    const blocks = page.locator('.block');
    const secondBlockType = await blocks.nth(1).getAttribute('data-block-type');
    expect(secondBlockType).toBe('h3');
    
    const h3Element = blocks.nth(1).locator('h3');
    await expect(h3Element).toBeVisible();
    await expect(h3Element).toContainText('H3 content');
  });

  test('should handle multiple block deletions and conversions', async ({ page }) => {
    // Test multiple cycles of deletion and conversion
    for (let i = 1; i <= 3; i++) {
      const firstBlock = page.locator('[contenteditable="true"]').first();
      await firstBlock.click();
      await page.keyboard.type(`Content ${i}`);
      
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(300);
      
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await page.keyboard.type(`Header ${i}`);
      
      const h1Button = page.locator('.editor-toolbar-header1');
      await h1Button.click();
      await page.waitForTimeout(300);
      
      const blocks = page.locator('.block');
      const secondBlockType = await blocks.nth(1).getAttribute('data-block-type');
      expect(secondBlockType).toBe('h1');
      
      const h1Element = blocks.nth(1).locator('h1');
      await expect(h1Element).toContainText(`Header ${i}`);
    }
  });

  test('should convert first block correctly when it is the only block', async ({ page }) => {
    // Edge case: converting a single block should still work
    const firstBlock = page.locator('[contenteditable="true"]').first();
    await firstBlock.click();
    await page.keyboard.type('Single block');
    
    const h1Button = page.locator('.editor-toolbar-header1');
    await h1Button.click();
    await page.waitForTimeout(300);
    
    const blocks = page.locator('.block');
    const count = await blocks.count();
    expect(count).toBe(1);
    
    const blockType = await blocks.first().getAttribute('data-block-type');
    expect(blockType).toBe('h1');
    
    const h1Element = blocks.first().locator('h1');
    await expect(h1Element).toBeVisible();
    await expect(h1Element).toContainText('Single block');
  });
});
