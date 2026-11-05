# WordPress Block Architecture

Design patterns, component structures, and architectural guidance for maintainable, reusable WordPress blocks.

## Purpose

This skill helps you design block architecture that scales — components that are easy to test, reuse, and maintain across multiple block themes and plugins.

## When to Use

- Planning the structure of a new block
- Deciding between functional and class components
- Organizing block logic with React hooks
- Designing block variations and composable patterns
- Reviewing block code for architectural issues
- Making block composition and dependency decisions

## Block Component Structure

### Functional Components (Recommended)

**Use functional components with React hooks for new blocks.** They're simpler, more testable, and align with modern WordPress block development.

**Pattern:**
```jsx
const MyBlock = ({ attributes, setAttributes, context }) => {
  const [internalState, setInternalState] = useState(null);
  
  return (
    <div className="wp-block-my-block">
      {/* Block content */}
    </div>
  );
};

export default memo(MyBlock);
```

**Benefits:**
- ✅ Easier to test (pure functions)
- ✅ Smaller component files
- ✅ Hooks compose better than class methods
- ✅ Better performance with `memo()`

### Class Components (Legacy)

Use only when:
- Upgrading existing blocks (breaking change cost)
- Integrating with old WordPress plugins
- Complex lifecycle management required (rare in blocks)

**Pattern:**
```jsx
class MyBlock extends Component {
  render() {
    return <div className="wp-block-my-block">{/* content */}</div>;
  }
}
```

## Hook Organization

### Custom Hooks for Block Logic

Extract reusable logic into custom hooks. Keep blocks focused on rendering.

**Pattern:**

```jsx
// hooks/useBlockData.js
export const useBlockData = (attributes) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch or process data
  }, [attributes]);
  
  return { data, loading };
};

// Edit.js
export const BlockEdit = (props) => {
  const { data, loading } = useBlockData(props.attributes);
  
  return loading ? <Placeholder /> : <BlockPreview data={data} />;
};
```

**Benefits:**
- ✅ Reusable across multiple blocks
- ✅ Easier to test in isolation
- ✅ Clean separation of concerns
- ✅ Easier to debug

### WordPress Block Hooks

**useBlockProps** — Apply block wrapper attributes and styles:
```jsx
const blockProps = useBlockProps({
  className: 'my-custom-class'
});

return <div {...blockProps}>{/* content */}</div>;
```

**useInnerBlocksProps** — For container blocks:
```jsx
const innerBlocksProps = useInnerBlocksProps(
  useBlockProps(),
  { allowedBlocks: ['core/paragraph'] }
);

return <div {...innerBlocksProps} />;
```

**useSelect/useDispatch** — Access WordPress data:
```jsx
const { postTitle } = useSelect((select) => ({
  postTitle: select('core/editor').getEditedPostAttribute('title')
}));
```

## Block Composition Patterns

### Pattern 1: Wrapper/Container Blocks

Use for layouts that hold other blocks (columns, tabs, accordions).

**Structure:**
```jsx
// Container block
export const TabsEdit = ({ attributes, setAttributes, clientId }) => {
  const innerBlocksProps = useInnerBlocksProps(
    useBlockProps(),
    { 
      allowedBlocks: ['block/tab-item'],
      orientation: 'vertical'
    }
  );
  
  return <div {...innerBlocksProps} />;
};
```

**Branch naming:** `feat/block-tabs-container-composition`

### Pattern 2: Block Variations

Reuse a single block with different configurations instead of creating multiple blocks.

**Pattern:**
```jsx
// block.json
"variations": [
  {
    "name": "primary",
    "title": "Primary Button",
    "attributes": { "buttonType": "primary" }
  },
  {
    "name": "secondary", 
    "title": "Secondary Button",
    "attributes": { "buttonType": "secondary" }
  }
]
```

**Benefits:**
- ✅ Reduced code duplication
- ✅ Shared logic and styling
- ✅ Easier to maintain
- ✅ Users see grouped variants in the editor

**Branch naming:** `feat/block-button-variations-style`

### Pattern 3: Composable Block Utilities

Create utility functions for common block patterns (rendering, validation, transformation).

**Pattern:**
```jsx
// utils/blockRendering.js
export const renderBlockContent = (attributes, className) => {
  return {
    className: `${className} ${attributes.align || ''}`,
    style: {
      textAlign: attributes.alignment,
      color: attributes.textColor
    }
  };
};

// Edit.js
const blockProps = renderBlockContent(attributes, 'my-block');
return <div {...blockProps}>{/* content */}</div>;
```

**Benefits:**
- ✅ Consistent rendering across block variations
- ✅ Easier to test rendering logic
- ✅ DRY principle applied to blocks

## State Management in Blocks

### Local State (useState)

For block-specific state that doesn't need to persist:
```jsx
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState(0);
```

Use for: temporary UI state, dropdowns, accordions, tabs.

### Block Attributes (setAttributes)

For state that should persist in the post/page:
```jsx
const { attributes, setAttributes } = props;

const handleChange = (newValue) => {
  setAttributes({ content: newValue });
};
```

Use for: user content, configuration, settings.

### Context API (for complex state)

For state shared across multiple nested blocks:
```jsx
const BlockContext = createContext();

export const TabsContainer = ({ children, activeTab }) => (
  <BlockContext.Provider value={{ activeTab }}>
    {children}
  </BlockContext.Provider>
);

export const TabItem = () => {
  const { activeTab } = useContext(BlockContext);
  return <div style={{ display: activeTab === 0 ? 'block' : 'none' }} />;
};
```

Use for: multi-block coordination (tabs, accordions, carousels).

**Do NOT use Redux** — WordPress blocks don't need global Redux. Context or component state is sufficient for block-level state.

**Branch naming:** `feat/block-accordion-context-state`

## Reusability Patterns

### Pattern: Extracting Common Block Logic

When multiple blocks share similar patterns:

1. Create a shared `hooks/` folder
2. Extract common logic into custom hooks
3. Use hooks in each block's Edit component

**Example:**
```jsx
// hooks/useResponsiveColumns.js
export const useResponsiveColumns = (attributes) => {
  const [columns, setColumns] = useState(attributes.columns);
  
  useEffect(() => {
    const handleResize = () => {
      // Calculate responsive columns
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return columns;
};

// blocks/gallery/Edit.js
const Gallery = (props) => {
  const columns = useResponsiveColumns(props.attributes);
  return <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} />;
};

// blocks/team/Edit.js
const TeamGrid = (props) => {
  const columns = useResponsiveColumns(props.attributes);
  return <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} />;
};
```

**Branch naming:** `refactor/block-responsive-columns-extraction`

## Performance Considerations

### Memoization

Use `memo()` to prevent unnecessary re-renders:
```jsx
export default memo(MyBlock, (prev, next) => {
  // Return true if props are equal (skip render)
  return prev.attributes === next.attributes;
});
```

### useCallback for Event Handlers

Prevent functions from being recreated on every render:
```jsx
const handleClick = useCallback(() => {
  setAttributes({ clicked: true });
}, []);
```

### useMemo for Expensive Calculations

Cache computed values:
```jsx
const processedData = useMemo(() => {
  return expensiveTransformation(attributes.data);
}, [attributes.data]);
```

## Testing Block Architecture

### Unit Tests (Jest)

Test component logic in isolation:
```jsx
describe('MyBlock', () => {
  it('renders with correct attributes', () => {
    const { container } = render(
      <MyBlock attributes={{ title: 'Test' }} setAttributes={jest.fn()} />
    );
    expect(container).toHaveTextContent('Test');
  });
});
```

### Integration Tests (Playwright)

Test block behavior in the editor:
```jsx
test('block responds to attribute changes', async ({ page }) => {
  await page.click('[aria-label="Add block"]');
  await page.click('text=My Block');
  await page.fill('input[type="text"]', 'New Title');
  await expect(page.locator('.wp-block-my-block')).toContainText('New Title');
});
```

**Branch naming:** `test/block-architecture-integration-tests`

## Anti-Patterns to Avoid

❌ **Mixing rendering and business logic** — Extract custom hooks  
❌ **Using class components for new blocks** — Use functional components  
❌ **Multiple setAttributes calls in a handler** — Batch into one call  
❌ **Global Redux state** — Use Context or local state  
❌ **Skipping memoization for heavy components** — Wrap with memo()  
❌ **Not testing custom hooks** — Test hooks in isolation  

## Resources

- **Block Composition:** See [references/plugins.md](plugins.md) for plugin-specific composition patterns
- **Performance Optimization:** See [references/testing.md](testing.md) for performance testing
- **Real Examples:** Check the gallery, carousel, and accordion blocks in your theme for reference implementations

## Quick Checklist

- ✅ Using functional components with hooks?
- ✅ Custom hooks extracted for reusable logic?
- ✅ Block attributes for persistent state?
- ✅ Context API for multi-block coordination?
- ✅ Components memoized if needed?
- ✅ Event handlers wrapped with useCallback?
- ✅ Expensive calculations with useMemo?
- ✅ Unit and integration tests for architecture?
- ✅ Branch naming follows block-{component}-{pattern} format?
