'use strict';

// Break circular deps
jest.mock('../src/Editor.js');
jest.mock('@/utils/log.js');

import { BlockInterfaceContract } from '../src/interfaces/BlockInterface.js';
import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';
import { H1Block } from '../src/blocks/H1Block.js';
import { UnorderedListBlock } from '../src/blocks/UnorderedListBlock.js';
import { OrderedListBlock } from '../src/blocks/OrderedListBlock.js';
import { CodeBlock } from '../src/blocks/CodeBlock.js';
import { QuoteBlock } from '../src/blocks/QuoteBlock.js';
import { DelimiterBlock } from '../src/blocks/DelimiterBlock.js';

const BLOCK_CLASSES = [
    { name: 'ParagraphBlock', Class: ParagraphBlock },
    { name: 'H1Block', Class: H1Block },
    { name: 'UnorderedListBlock', Class: UnorderedListBlock },
    { name: 'OrderedListBlock', Class: OrderedListBlock },
    { name: 'CodeBlock', Class: CodeBlock },
    { name: 'QuoteBlock', Class: QuoteBlock },
    { name: 'DelimiterBlock', Class: DelimiterBlock },
];

describe('BlockInterface', () => {
    describe('BlockInterfaceContract shape', () => {
        it('exports INSTANCE_METHODS as an array', () => {
            expect(Array.isArray(BlockInterfaceContract.INSTANCE_METHODS)).toBe(true);
            expect(BlockInterfaceContract.INSTANCE_METHODS.length).toBeGreaterThan(0);
        });

        it('exports STATIC_METHODS as an array', () => {
            expect(Array.isArray(BlockInterfaceContract.STATIC_METHODS)).toBe(true);
            expect(BlockInterfaceContract.STATIC_METHODS.length).toBeGreaterThan(0);
        });

        it('INSTANCE_METHODS includes required methods', () => {
            const required = ['handleKeyPress', 'handleEnterKey', 'toMarkdown', 'toHtml'];
            required.forEach(m => {
                expect(BlockInterfaceContract.INSTANCE_METHODS).toContain(m);
            });
        });

        it('STATIC_METHODS includes required methods', () => {
            const required = ['getMarkdownTriggers', 'getToolbarConfig'];
            required.forEach(m => {
                expect(BlockInterfaceContract.STATIC_METHODS).toContain(m);
            });
        });
    });

    // Verify each block class satisfies the contract
    BLOCK_CLASSES.forEach(({ name, Class }) => {
        describe(`${name} satisfies BlockInterfaceContract`, () => {
            let instance;

            beforeEach(() => {
                instance = new Class();
            });

            BlockInterfaceContract.INSTANCE_METHODS.forEach(method => {
                it(`has instance method: ${method}()`, () => {
                    expect(typeof instance[method]).toBe('function');
                });
            });

            BlockInterfaceContract.STATIC_METHODS.forEach(method => {
                it(`has static method: ${method}()`, () => {
                    expect(typeof Class[method]).toBe('function');
                });
            });

            it('has a string type property', () => {
                expect(typeof instance.type).toBe('string');
                expect(instance.type.length).toBeGreaterThan(0);
            });
        });
    });

    describe('validate method', () => {
        it('exercises validate code path - returns boolean', () => {
            const result = BlockInterfaceContract.validate(ParagraphBlock);
            expect(typeof result).toBe('boolean');
        });

        it('returns false for a class missing static methods', () => {
            class BadBlock {}
            const result = BlockInterfaceContract.validate(BadBlock);
            expect(result).toBe(false);
        });

        it('throws for null input (null lacks properties)', () => {
            expect(() => BlockInterfaceContract.validate(null)).toThrow();
        });
    });
});
