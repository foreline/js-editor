# Toolbar Groups Documentation

## Overview

The JS Editor supports organizing toolbar buttons into logical groups, providing better UX and maintainability. Toolbar groups can be configured to display as regular button groups or as dropdown menus.

## Configuration Structure

The toolbar configuration is passed during Editor initialization:

```javascript
const editor = new Editor({
    id: 'editor',
    container: document.querySelector('.editor-container'),
    toolbar: {
        container: document.querySelector('.editor-container'),
        config: toolbarConfig // Array of group configurations
    }
});
```

## Group Types

### 1. Regular Button Groups

```javascript
{
    group: [
        { class: 'editor-toolbar-bold', icon: 'fa-bold', title: 'Bold text' },
        { class: 'editor-toolbar-italic', icon: 'fa-italic', title: 'Italic text' },
        { class: 'editor-toolbar-underline', icon: 'fa-underline', title: 'Underline text' }
    ]
}
```

### 2. Dropdown Groups

```javascript
{
    group: [
        { class: 'editor-toolbar-header1', label: 'Header 1' },
        { class: 'editor-toolbar-header2', label: 'Header 2' },
        { class: 'editor-toolbar-header3', label: 'Header 3' }
    ],
    dropdown: true,
    icon: 'fa-heading',
    id: 'dropdownMenuHeader'
}
```

## Button Properties

Each button in a group can have the following properties:

- `class` (required): CSS class name used for styling and event handling
- `icon`: FontAwesome icon class (e.g., 'fa-bold')
- `label`: Button text label
- `title`: Tooltip text
- `disabled`: Boolean to disable the button initially

## Current Groups Implementation

The editor comes with the following pre-configured logical groups:

### 1. History Group
- Undo (`editor-toolbar-undo`)
- Redo (`editor-toolbar-redo`)

### 2. Headers Group (Dropdown)
- Header 1-6 (`editor-toolbar-header1` to `editor-toolbar-header6`)
- Paragraph (`editor-toolbar-paragraph`)

### 3. Formatting Group
- Bold (`editor-toolbar-bold`)
- Italic (`editor-toolbar-italic`)
- Underline (`editor-toolbar-underline`)
- Strikethrough (`editor-toolbar-strikethrough`)

### 4. Lists Group
- Unordered List (`editor-toolbar-ul`)
- Ordered List (`editor-toolbar-ol`)
- Checklist (`editor-toolbar-sq`)

### 5. Code Group
- Code Block (`editor-toolbar-code`)

### 6. View Group
- Text View (`editor-toolbar-text`)
- Markdown View (`editor-toolbar-markdown`)
- HTML View (`editor-toolbar-html`)

## Styling

Groups are automatically wrapped in `.editor-toolbar-group` divs, allowing for CSS styling:

```css
.editor-toolbar-group {
    display: inline-flex;
    margin-right: 10px;
    border-right: 1px solid #ddd;
    padding-right: 10px;
}

.editor-toolbar-group:last-child {
    border-right: none;
    margin-right: 0;
}
```

## Event Handling

Button event handlers are automatically attached based on the button's class name. The `ToolbarHandlers.init()` method sets up click listeners that map to corresponding methods in the `Toolbar` object.

For example:
- `editor-toolbar-bold` → `Toolbar.bold()`
- `editor-toolbar-h1` → `Toolbar.h1()`
- `editor-toolbar-ul` → `Toolbar.ul()`

## Adding Custom Groups

To add a new group, extend the toolbar configuration:

```javascript
const customGroup = {
    group: [
        { class: 'editor-toolbar-custom', icon: 'fa-custom', title: 'Custom Action' }
    ]
};

toolbarConfig.push(customGroup);
```

Then implement the corresponding method in `Toolbar.js`:

```javascript
custom: () => {
    log('custom()', 'Toolbar.');
    // Custom functionality here
    Toolbar.after();
}
```

## Bootstrap Integration

Dropdown groups use Bootstrap's dropdown component with the following classes:
- `.dropdown` - Dropdown container
- `.btn.btn-secondary.dropdown-toggle` - Dropdown button
- `.dropdown-menu` - Dropdown menu container

Make sure Bootstrap CSS and JavaScript are included in your project for dropdown functionality.

## Testing

The toolbar groups functionality is tested in `tests/ToolbarGroups.test.js`, covering:
- Multiple group creation
- Dropdown group functionality
- Button property handling
- Logical organization
- DOM insertion

Run tests with:
```bash
npm test -- tests/ToolbarGroups.test.js
```
