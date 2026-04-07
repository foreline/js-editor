# Event System Documentation

The JS Editor provides a comprehensive event management system that allows developers to monitor and respond to content changes, user interactions, and system events. The system is **instance-based**, meaning each editor instance has its own isolated event emitter.

## Overview

The event system is built around the `EditorEventEmitter` class, which provides:
- **Instance isolation**: Each editor has its own event system to prevent cross-contamination
- **Debouncing**: Delays event emission until after a specified time has passed since the last call
- **Throttling**: Ensures events are emitted at most once per specified time period
- **Prioritization**: Events can be handled in priority order
- **One-time subscriptions**: Events that fire only once
- **Structured event data**: Consistent event payload structure
- **Memory management**: Automatic cleanup of invalid listeners

## Instance-Based Architecture

Each editor instance creates its own `EditorEventEmitter`:

```javascript
import { Editor } from './src/Editor.js';
import { EVENTS } from './src/utils/eventEmitter.js';

// Each editor instance has its own isolated event system
const editor1 = new Editor({ id: 'editor1', debug: true });
const editor2 = new Editor({ id: 'editor2', debug: true });

// Events from editor1 don't affect editor2 and vice versa
editor1.on(EVENTS.CONTENT_CHANGED, (data) => {
    console.log('Editor 1 changed:', data.data.markdown);
});

editor2.on(EVENTS.CONTENT_CHANGED, (data) => {
    console.log('Editor 2 changed:', data.data.markdown);
});
```

## Event Categories

Events are organized into logical categories:

### CONTENT Events
- `content.changed` - Debounced content changes for backend synchronization
- `content.saved` - When content is saved to backend

### BLOCK Events  
- `block.created` - When a new block is created
- `block.deleted` - When a block is deleted
- `block.focused` - When a block gains focus (throttled)
- `block.content.changed` - When block content changes (throttled)
- `block.type.changed` - When a block type is converted

### EDITOR Events
- `editor.initialized` - When the editor is initialized
- `editor.focused` - When the editor gains focus
- `editor.blurred` - When the editor loses focus
- `editor.updated` - Legacy compatibility event

### TOOLBAR Events
- `toolbar.action` - When toolbar buttons are clicked

### USER Events
- `user.paste` - When user pastes content
- `user.keypress` - When user presses keys (throttled)

## Usage Examples

### Basic Event Subscription

```javascript
import { Editor } from './src/Editor.js';
import { EVENTS } from './src/utils/eventEmitter.js';

// Create an editor instance
const editor = new Editor({ id: 'my-editor', debug: true });

// Subscribe to content changes for auto-save
editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    console.log('Content changed at:', eventData.timestamp);
    console.log('Markdown content:', eventData.data.markdown);
    console.log('HTML content:', eventData.data.html);
    
    // Send to backend
    saveToBackend(eventData.data);
});

// Subscribe to block creation
editor.on(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('New block created:', eventData.data.blockType);
    console.log('Block ID:', eventData.data.blockId);
});
```

### Instance Methods for Events

```javascript
const editor = new Editor({ id: 'my-editor' });

// Subscribe to events (returns subscription object)
const subscription = editor.on(EVENTS.BLOCK_FOCUSED, (eventData) => {
    console.log('Block focused:', eventData.data.blockType);
});

// One-time subscription
editor.once(EVENTS.EDITOR_INITIALIZED, (eventData) => {
    console.log('Editor is ready!');
});

// Unsubscribe using subscription object
subscription.unsubscribe();

// Or unsubscribe using the off method
function myHandler(eventData) {
    console.log('My handler');
}
editor.on(EVENTS.CONTENT_CHANGED, myHandler);
editor.off(EVENTS.CONTENT_CHANGED, myHandler);

// Emit custom events
editor.emit('custom.event', { customData: 'value' }, { debounce: 300 });
```

### Event Options

```javascript
const editor = new Editor({ id: 'my-editor' });

// One-time subscription
editor.once(EVENTS.EDITOR_INITIALIZED, (eventData) => {
    console.log('Editor initialized');
});

// High priority handler (executes first)
editor.on(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('High priority block creation handler');
}, { priority: 10 });

// Low priority handler (executes later)
editor.on(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('Low priority block creation handler');
}, { priority: 1 });

// Subscribe with throttling option (for high-frequency events)
editor.on(EVENTS.USER_KEY_PRESS, (eventData) => {
    console.log('Key pressed:', eventData.data.key);
}, { throttle: 100 });
```

### Debounced and Throttled Events

```javascript
const editor = new Editor({ id: 'my-editor' });

// Content change events are automatically debounced (500ms default)
editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    // This will only fire 500ms after the last content change
    sendToBackend(eventData.data);
});

// User key press events are automatically throttled (50ms default)
editor.on(EVENTS.USER_KEY_PRESS, (eventData) => {
    // This will fire at most once every 50ms
    console.log('Key pressed:', eventData.data.key);
});

// Block focus events are throttled (50ms default)
editor.on(EVENTS.BLOCK_FOCUSED, (eventData) => {
    console.log('Block focused:', eventData.data.blockType);
});
```

### Manual Event Emission

```javascript
const editor = new Editor({ id: 'my-editor' });

// Emit with debouncing
editor.emit('custom.event', { data: 'value' }, { debounce: 300 });

// Emit with throttling  
editor.emit('custom.event', { data: 'value' }, { throttle: 100 });

// Emit immediately
editor.emit('custom.event', { data: 'value' });

// Emit with source identifier
editor.emit(EVENTS.CONTENT_CHANGED, { 
    markdown: editor.getMarkdown(),
    html: editor.getHtml()
}, { 
    debounce: 500, 
    source: 'manual.update'
});
```

### Unsubscribing

```javascript
const editor = new Editor({ id: 'my-editor' });

// Method 1: Using subscription object
const subscription = editor.on(EVENTS.BLOCK_FOCUSED, (eventData) => {
    console.log('Block focused');
});
subscription.unsubscribe();

// Method 2: Using off method with callback reference
function myHandler(eventData) {
    console.log('My handler');
}
editor.on(EVENTS.CONTENT_CHANGED, myHandler);
editor.off(EVENTS.CONTENT_CHANGED, myHandler);

// Method 3: Cleanup all events when destroying editor
editor.destroy(); // This cleans up all events and DOM references
```

## Event Data Structure

All events follow a consistent data structure:

```javascript
{
    type: 'event.type',           // Event type identifier
    timestamp: 1642684800000,     // Unix timestamp when event occurred
    source: 'editor',             // Source that triggered the event
    data: {                       // Event-specific data
        // Varies by event type
        blockId: 'block-123',
        content: 'new content',
        // ... other event-specific properties
    }
}
```

## Block Content Tracking

The event system includes automatic content change tracking:

### Timestamp Attributes
- `data-timestamp` - When block content was last modified
- `data-last-content` - Previous content for comparison
- `data-block-id` - Unique identifier for each block

### Change Detection
The system automatically:
1. Compares current content with `data-last-content`
2. Updates `data-timestamp` when content changes
3. Emits `block.content.changed` events (throttled)
4. Stores new content in `data-last-content`

## Performance Considerations

### Debouncing
- Used for content change events to prevent excessive backend calls
- Default delay: 500ms for `CONTENT_CHANGED` events
- Cancels previous timer when new event occurs

### Throttling  
- Used for high-frequency events like key presses and focus changes
- Default delays: 50ms for key presses, 200ms for content changes
- Ensures events fire at most once per time period

### Memory Management
The event system includes automatic cleanup:
- Invalid listeners are removed during cleanup
- Event timers are cleared on cleanup
- Listeners are removed when event types have no subscribers

## Integration Examples

### Auto-save Implementation

```javascript
import { Editor } from './src/Editor.js';
import { EVENTS } from './src/utils/eventEmitter.js';

class AutoSave {
    constructor(editor, saveEndpoint) {
        this.editor = editor;
        this.saveEndpoint = saveEndpoint;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Auto-save on content changes (debounced)
        this.editor.on(EVENTS.CONTENT_CHANGED, async (eventData) => {
            try {
                await this.saveContent(eventData.data);
                console.log('Content auto-saved');
                
                // Emit save success event
                this.editor.emit(EVENTS.CONTENT_SAVED, {
                    timestamp: eventData.timestamp,
                    success: true
                });
            } catch (error) {
                console.error('Auto-save failed:', error);
                
                // Emit save failure event
                this.editor.emit('content.save.failed', {
                    timestamp: eventData.timestamp,
                    error: error.message
                });
            }
        });
    }
    
    async saveContent(data) {
        const response = await fetch(this.saveEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                markdown: data.markdown,
                html: data.html,
                timestamp: data.timestamp
            })
        });
        
        if (!response.ok) {
            throw new Error('Save failed');
        }
        
        return response.json();
    }
}

// Initialize auto-save for a specific editor
const editor = new Editor({ id: 'my-editor' });
const autoSave = new AutoSave(editor, '/api/save-content');
```

### Analytics Integration

```javascript
import { Editor } from './src/Editor.js';
import { EVENTS } from './src/utils/eventEmitter.js';

class EditorAnalytics {
    constructor(editor, trackingId) {
        this.editor = editor;
        this.trackingId = trackingId;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Track user interactions
        this.editor.on(EVENTS.USER_KEY_PRESS, (eventData) => {
            this.trackEvent('keypress', {
                key: eventData.data.key,
                blockType: eventData.data.blockType,
                editorId: this.editor.instance.id
            });
        });
        
        this.editor.on(EVENTS.TOOLBAR_ACTION, (eventData) => {
            this.trackEvent('toolbar_action', {
                action: eventData.data.action,
                editorId: this.editor.instance.id
            });
        });
        
        this.editor.on(EVENTS.BLOCK_CREATED, (eventData) => {
            this.trackEvent('block_created', {
                blockType: eventData.data.blockType,
                editorId: this.editor.instance.id
            });
        });
        
        this.editor.on(EVENTS.USER_PASTE, (eventData) => {
            this.trackEvent('user_paste', {
                textLength: eventData.data.text?.length || 0,
                hasHtml: !!eventData.data.html,
                editorId: this.editor.instance.id
            });
        });
    }
    
    trackEvent(eventName, properties) {
        // Send to analytics service
        console.log('Analytics:', eventName, {
            ...properties,
            trackingId: this.trackingId,
            timestamp: Date.now()
        });
    }
}

// Initialize analytics for specific editors
const editor1 = new Editor({ id: 'editor1' });
const editor2 = new Editor({ id: 'editor2' });

const analytics1 = new EditorAnalytics(editor1, 'track-editor-1');
const analytics2 = new EditorAnalytics(editor2, 'track-editor-2');
```

## Migration from Legacy Events

The new event system maintains backward compatibility. For legacy code, there's still a global `eventEmitter` available:

```javascript
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

// Legacy usage (still works - uses global instance)
eventEmitter.subscribe(EVENTS.EDITOR_UPDATED, (eventData) => {
    console.log('Legacy event handler');
});

// New usage (recommended - uses instance-specific events)
const editor = new Editor({ id: 'my-editor' });
editor.on(EVENTS.EDITOR_UPDATED, (eventData) => {
    console.log('New event handler');
    console.log('Structured data:', eventData.data);
});
```

### Migration Guide

**Old way (global events):**
```javascript
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    console.log(eventData.data.markdown);
});
```

**New way (instance events):**
```javascript
import { Editor } from './src/Editor.js';
import { EVENTS } from './src/utils/eventEmitter.js';

const editor = new Editor({ id: 'my-editor' });
editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    console.log(eventData.data.markdown);
});
```

### Benefits of Instance-Based Events

1. **Isolation**: Events from one editor don't affect another
2. **Memory Management**: Events are cleaned up when editor is destroyed
3. **Multiple Editors**: Support for multiple editor instances on the same page
4. **Better Testing**: Each test can have its own isolated editor instance
5. **Type Safety**: Better TypeScript support with instance-specific typing

## Error Handling

The event system includes robust error handling that prevents one faulty handler from breaking others:

```javascript
const editor = new Editor({ id: 'my-editor' });

editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    // If this handler throws an error, it won't affect other handlers
    throw new Error('Handler error');
});

editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    // This handler will still execute even if the previous one failed
    console.log('This still works');
});

// Error handling in async handlers
editor.on(EVENTS.CONTENT_CHANGED, async (eventData) => {
    try {
        await saveToBackend(eventData.data);
    } catch (error) {
        console.error('Save failed:', error);
        // Handle error gracefully without breaking other handlers
    }
});
```

## Debugging

Enable debug mode to see all event emissions:

```javascript
// Enable debug mode when creating the editor
const editor = new Editor({ 
    id: 'my-editor', 
    debug: true  // This enables debug logging for the instance event emitter
});

// Or enable debug on the instance after creation
editor.eventEmitter.debug = true;

// For the global event emitter (legacy)
import { eventEmitter } from './src/utils/eventEmitter.js';
eventEmitter.debug = true;
```

Debug output shows:
- Event type and timestamp
- Event data structure
- Source that triggered the event
- Color-coded console messages for easy identification

### Performance Monitoring

```javascript
const editor = new Editor({ id: 'my-editor' });

// Monitor event performance
editor.on(EVENTS.CONTENT_CHANGED, (eventData) => {
    const startTime = performance.now();
    
    // Your event handler code here
    processContent(eventData.data);
    
    const endTime = performance.now();
    console.log(`Content processing took ${endTime - startTime} ms`);
});

// Monitor listener counts
console.log('Content change listeners:', 
    editor.eventEmitter.getListenerCount(EVENTS.CONTENT_CHANGED));

// Get all active event types
console.log('Active events:', editor.eventEmitter.getEventTypes());
```

## Best Practices

1. **Use instance methods**: Prefer `editor.on()` over global `eventEmitter.subscribe()`
2. **Clean up subscriptions**: Use `subscription.unsubscribe()` or `editor.destroy()` to prevent memory leaks
3. **Handle errors gracefully**: Wrap async operations in try-catch blocks
4. **Use appropriate options**: Apply throttling/debouncing for high-frequency events
5. **Instance isolation**: Create separate editor instances for different use cases
6. **Testing**: Each test should create its own editor instance for isolation
