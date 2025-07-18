# Event System Documentation

The JS Editor provides a comprehensive event management system that allows developers to monitor and respond to content changes, user interactions, and system events.

## Overview

The event system is built around the `EditorEventEmitter` class, which provides:
- **Debouncing**: Delays event emission until after a specified time has passed since the last call
- **Throttling**: Ensures events are emitted at most once per specified time period
- **Prioritization**: Events can be handled in priority order
- **One-time subscriptions**: Events that fire only once
- **Structured event data**: Consistent event payload structure
- **Memory management**: Automatic cleanup of invalid listeners

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
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

// Subscribe to content changes for auto-save
eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    console.log('Content changed at:', eventData.timestamp);
    console.log('Markdown content:', eventData.data.markdown);
    console.log('HTML content:', eventData.data.html);
    
    // Send to backend
    saveToBackend(eventData.data);
});
```

### Event Options

```javascript
// One-time subscription
eventEmitter.subscribe(EVENTS.EDITOR_INITIALIZED, (eventData) => {
    console.log('Editor initialized');
}, { once: true });

// High priority handler (executes first)
eventEmitter.subscribe(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('High priority block creation handler');
}, { priority: 10 });

// Low priority handler (executes later)
eventEmitter.subscribe(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('Low priority block creation handler');
}, { priority: 1 });
```

### Debounced and Throttled Events

```javascript
// Content change events are automatically debounced (500ms default)
eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    // This will only fire 500ms after the last content change
    sendToBackend(eventData.data);
});

// User key press events are automatically throttled (50ms default)
eventEmitter.subscribe(EVENTS.USER_KEY_PRESS, (eventData) => {
    // This will fire at most once every 50ms
    console.log('Key pressed:', eventData.data.key);
});
```

### Manual Event Emission

```javascript
// Emit with debouncing
eventEmitter.emit('custom.event', { data: 'value' }, { debounce: 300 });

// Emit with throttling  
eventEmitter.emit('custom.event', { data: 'value' }, { throttle: 100 });

// Emit immediately
eventEmitter.emit('custom.event', { data: 'value' });
```

### Unsubscribing

```javascript
const subscription = eventEmitter.subscribe(EVENTS.BLOCK_FOCUSED, (eventData) => {
    console.log('Block focused');
});

// Later, unsubscribe
subscription.unsubscribe();
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
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

class AutoSave {
    constructor(saveEndpoint) {
        this.saveEndpoint = saveEndpoint;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Auto-save on content changes (debounced)
        eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, async (eventData) => {
            try {
                await this.saveContent(eventData.data);
                console.log('Content auto-saved');
                
                // Emit save success event
                eventEmitter.emit(EVENTS.CONTENT_SAVED, {
                    timestamp: eventData.timestamp,
                    success: true
                });
            } catch (error) {
                console.error('Auto-save failed:', error);
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

// Initialize auto-save
const autoSave = new AutoSave('/api/save-content');
```

### Analytics Integration

```javascript
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

class EditorAnalytics {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Track user interactions
        eventEmitter.subscribe(EVENTS.USER_KEY_PRESS, (eventData) => {
            this.trackEvent('keypress', {
                key: eventData.data.key,
                blockType: eventData.data.blockType
            });
        });
        
        eventEmitter.subscribe(EVENTS.TOOLBAR_ACTION, (eventData) => {
            this.trackEvent('toolbar_action', {
                action: eventData.data.action
            });
        });
        
        eventEmitter.subscribe(EVENTS.BLOCK_CREATED, (eventData) => {
            this.trackEvent('block_created', {
                blockType: eventData.data.blockType
            });
        });
    }
    
    trackEvent(eventName, properties) {
        // Send to analytics service
        console.log('Analytics:', eventName, properties);
    }
}

// Initialize analytics
const analytics = new EditorAnalytics();
```

## Migration from Legacy Events

The new event system maintains backward compatibility:

```javascript
// Legacy usage (still works)
eventEmitter.subscribe('EDITOR.UPDATED_EVENT', (eventData) => {
    console.log('Legacy event handler');
});

// New usage (recommended)
eventEmitter.subscribe(EVENTS.EDITOR_UPDATED, (eventData) => {
    console.log('New event handler');
    console.log('Structured data:', eventData.data);
});
```

## Error Handling

The event system includes robust error handling:

```javascript
eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    // If this handler throws an error, it won't affect other handlers
    throw new Error('Handler error');
});

eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    // This handler will still execute
    console.log('This still works');
});
```

## Debugging

Enable debug mode to see all event emissions:

```javascript
// Create emitter with debug enabled
const debugEmitter = new EditorEventEmitter({ debug: true });

// Or enable debug on global instance
eventEmitter.debug = true;
```

This will log all events to the console with their data.
