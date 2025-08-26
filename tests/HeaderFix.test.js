/**
 * Simple test for header conversion
 */

describe('Header Conversion Fix', () => {
    test('should not have circular dependency', () => {
        // This test just ensures HeadingBlock can be imported without circular dependency
        const { HeadingBlock } = require('../src/blocks/HeadingBlock.js');
        expect(HeadingBlock).toBeDefined();
    });
    
    test('HeadingBlock should have correct applyTransformation implementation', () => {
        const { HeadingBlock } = require('../src/blocks/HeadingBlock.js');
        const { H1Block } = require('../src/blocks/H1Block.js');
        
        // Create H1 block instance
        const h1Block = new H1Block();
        
        // Check that applyTransformation method exists and is a function
        expect(typeof h1Block.applyTransformation).toBe('function');
        
        // The method should not reference Toolbar.h1() anymore
        const methodString = h1Block.applyTransformation.toString();
        expect(methodString).not.toContain('Toolbar.h1()');
        expect(methodString).not.toContain('Toolbar.h2()');
        expect(methodString).not.toContain('switch(this.level)');
    });
});
