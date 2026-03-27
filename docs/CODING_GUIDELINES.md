# Coding Guidelines

> Adapted from battle-tested PR review conventions. These rules apply to all code in the webshop project.

---

## TypeScript

### No `any` — use `unknown` or specific types
Never use `any`. Use `unknown` for truly unknown types, or define proper types/interfaces. This applies to catch blocks, API responses, and generic parameters.

```ts
// Bad
catch (error: any) { ... }

// Good
catch (error: unknown) { ... }
```

### Use `type` over `interface` for props
Use `type Props = { ... }` for component prop definitions. Do not use `interface` unless declaration merging is needed.

```ts
// Bad
interface MyComponentProps { ... }

// Good
type Props = { ... };
```

### Type names must be PascalCase
```ts
// Bad
type trackingArea = "context menu" | "toolbar";

// Good
type TrackingArea = "context menu" | "toolbar";
```

### Prefer `Type[]` over `Array<Type>`
```ts
// Bad
children?: Array<string>;

// Good
children?: string[];
```

### Leverage utility types to avoid duplication
Use `Partial`, `Pick`, `Omit`, `Record`, etc. instead of duplicating type definitions.

### Use `import type` for type-only imports
```ts
import type { Product } from "@webshop/shared/types";
```

### Avoid type casts (`as Type`)
Use type narrowing (type guards, generics, conditional checks) instead. Casts hide nullability and type errors.

### Required parameters first, optional parameters last
```ts
// Bad
function getProducts(language = "hu", categoryId: string) { ... }

// Good
function getProducts(categoryId: string, language = "hu") { ... }
```

---

## React

### Always use arrow functions
Arrow functions are the standard for components, handlers, and helper functions.

```ts
// Bad
function MyComponent(props: Props) { ... }

// Good
const MyComponent = ({ name, value }: Props) => { ... };
```

### Destructure props in the function signature
```ts
// Bad
const Alert = (props: Props) => {
    const { message } = props;
};

// Good
const Alert = ({ message }: Props) => { ... };
```

### Only use `useCallback`/`useMemo` when justified
Do not wrap every handler in `useCallback` by default. Only use memoization when the function is passed to a memoized child or a computation is genuinely expensive.

### Use early returns to reduce nesting
```ts
const ProductCard = ({ product }: Props) => {
    const data = useQuery(...);

    if (!data) {
        return null;
    }

    return <div>{data.name}</div>;
};
```

### Return `null`, not `undefined`, when rendering nothing
```ts
// Bad
if (!visible) return;

// Good
if (!visible) return null;
```

### Separate `useState` for each state variable
```ts
// Bad
const [state, setState] = useState({ error: null, item: null });

// Good
const [error, setError] = useState<Error | null>(null);
const [item, setItem] = useState<Product | null>(null);
```

### Define types, constants, and helpers outside components
Only hooks and state-dependent logic belong inside the component body.

```ts
// Good
type Status = "active" | "inactive";
const OPTIONS = [{ label: "A" }, { label: "B" }];

const MyComponent = () => { ... };
```

### Do not create trivial wrapper components
If a component is a one-liner, inline it instead.

### `data-test-id` values use camelCase
```tsx
// Bad
data-test-id="my-button"

// Good
data-test-id="myButton"
```

Only add test IDs when they are actively used in tests.

---

## MUI / Styling

### Use `sx` callback instead of `useTheme` for single-use theme access
```tsx
// Bad
const MyComponent = () => {
    const theme = useTheme();
    return <Typography sx={{ color: theme.palette.primary.main }}>...</Typography>;
};

// Good
const MyComponent = () => {
    return <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>...</Typography>;
};
```

### Prefer MUI components over raw HTML elements
Use `Button`, `List`, `ListItem`, `Typography`, `Box`, etc. for consistency with the design system.

### Avoid unnecessary wrapper elements
Do not add `<div>`, `<Box>`, or `<span>` unless they serve a specific styling or semantic purpose.

### Use `sx` prop instead of `style` prop
```tsx
// Bad
<Box style={{ marginTop: 8 }}>

// Good
<Box sx={{ mt: 1 }}>
```

---

## Naming Conventions

### Functions and methods: `verbNoun`
```ts
// Bad
const productData = () => { ... };

// Good
const getProductData = () => { ... };
```

### Event handler props start with `on`, handler functions start with `handle`
```tsx
type Props = {
    onSelect: (id: string) => void;
};

const handleClick = () => { ... };
```

### No single-letter variable names
Use descriptive names. Especially avoid `T` which conflicts with TypeScript generics.

### Avoid generic names like `data`, `result`, `value`
```ts
// Bad
const data = await fetchProducts();

// Good
const products = await fetchProducts();
```

### Constants: `ALL_CAPS_SNAKE_CASE` or `camelCase`
```ts
const MAX_RETRIES = 3;
const maxRetries = 3;
// Never PascalCase for non-components
```

### Boolean defaults are `false` — don't initialize explicitly
```ts
// Good
const [isOpen, setIsOpen] = useState(false);
```

---

## Code Style

### Always use braces in `if`/`else` blocks
Even for single-line bodies.

```ts
// Bad
if (!product) return null;

// Good
if (!product) {
    return null;
}
```

### Eliminate unnecessary intermediate variables
```ts
// Bad
const isVisible = dialogInfo != null;
return <Dialog open={isVisible} />;

// Good
return <Dialog open={!!dialogInfo} />;
```

### No unnecessary `async/await`
Do not mark functions `async` when there is no `await`.

### Prefer positive conditions in ternaries
```ts
// Bad
!isActive ? <Inactive /> : <Active />

// Good
isActive ? <Active /> : <Inactive />
```

### Use `.includes()`, `.some()`, `.find()` over manual loops

### Extract magic numbers into named constants
```ts
const MAX_RETRIES = 3;
const FIVE_MINUTES_MS = 300_000;
```

### Use optional chaining and nullish coalescing
```ts
const permissions = currentUser?.permissions ?? [];
```

### No variable shadowing

### Keep declarations in alphabetical order
Type properties, imports within groups, and similar declarations should follow alphabetical order.

---

## Imports

### Use path aliases
Use the configured path aliases (`@webshop/shared/`, `@/`, etc.) rather than deep relative paths.

```ts
// Bad
import { Product } from "../../../shared/types";

// Good
import type { Product } from "@webshop/shared/types";
```

---

## Documentation

### No JSDoc for self-documenting code
TypeScript types provide sufficient documentation. Do not add JSDoc to components or methods where the signature is self-explanatory.

---

## Testing

### Test helpers and data go outside `describe` blocks

### Do not refactor working tests for style
Only change tests when fixing bugs or adding functionality.

---

## Remove Dead Code

Remove all unused imports, variables, functions, commented-out code, and unused function parameters.

---

## Architecture

### Extract duplicated logic
If the same logic appears 2+ times, extract into a shared utility.

### Do not over-engineer
Do not add defensive error handling for scenarios that cannot realistically occur. Keep solutions simple and focused on actual requirements.
