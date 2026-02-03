# Testing Guide

## What are Unit Tests?

Unit tests are automated tests that verify individual pieces of code work correctly in isolation. They test the smallest testable parts of an application - typically individual functions, methods, or components.

### Key Benefits:

- **Fast Feedback** - Catch bugs early in development
- **Documentation** - Tests serve as living documentation of how code should behave
- **Refactoring Safety** - Confidently change code knowing tests will catch regressions
- **Quality Assurance** - Ensure code meets requirements and handles edge cases

## Testing Framework

This project uses **Vitest** for JavaScript/TypeScript testing:

- Fast execution with native ES modules support
- Vue Test Utils for component testing
- JSDOM environment for browser API simulation
- Built-in mocking capabilities

## What We Test

### 1. Service Layer (`NodeService`)

**Location**: `resources/js/services/__tests__/nodeService.test.ts`

**Tests Cover**:

- Data transformation from backend to frontend format
- Layout export functionality
- Spacer node identification
- Edge cases (missing labels, empty data)

**Example**:

```typescript
it('should transform backend response to frontend nodes', () => {
    const backendData = {
        field1: { label: 'First Name', editorType: 'dxTextBox' },
    };
    const result = NodeService.transformBackendNodes(backendData);
    expect(result[0]).toEqual({
        id: 'field1',
        label: 'First Name',
        dataField: 'field1',
        editorType: 'dxTextBox',
        metadata: { label: 'First Name', editorType: 'dxTextBox' },
    });
});
```

### 2. State Management (`useNodeStore`)

**Location**: `resources/js/stores/__tests__/useNodeStore.test.ts`

**Tests Cover**:

- Store initialization with/without localStorage data
- Container CRUD operations (add, update, remove)
- Node management within containers
- Data persistence to localStorage
- Layout export functionality
- Name uniqueness validation

**Example**:

```typescript
it('should add a new container', () => {
    const store = useNodeStore();
    store.addContainer('Test Container');

    expect(store.workspaceContainers).toHaveLength(1);
    expect(store.workspaceContainers[0]).toEqual({
        id: 'test-uuid-123',
        name: 'Test Container',
        numCol: 1,
        nodes: [],
    });
});
```

### 3. Component Logic (Planned)

**Location**: `resources/js/components/node-ui/__tests__/`

**Should Test**:

- Component rendering based on props/state
- User interactions (clicks, form submissions)
- Event handling (drag & drop)
- Conditional rendering (empty states)
- Integration with stores

## Running Tests

### All Tests

```bash
npm run test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Specific Test File

```bash
npx vitest run resources/js/services/__tests__/nodeService.test.ts
```

### With Coverage

```bash
npx vitest run --coverage
```

## Test Structure

### Typical Test File Structure:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks
vi.mock('@/some/dependency', () => ({
    default: mockImplementation,
}));

describe('ComponentName', () => {
    beforeEach(() => {
        // Setup before each test
        vi.clearAllMocks();
    });

    describe('feature group', () => {
        it('should do something specific', () => {
            // Arrange
            const input = 'test data';

            // Act
            const result = functionUnderTest(input);

            // Assert
            expect(result).toBe('expected output');
        });
    });
});
```

## Mocking Strategies

### 1. Browser APIs

```typescript
// localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: vi.fn(() => 'test-uuid-123') },
});
```

### 2. External Dependencies

```typescript
// Mock JSON imports
vi.mock('@/assets/data/nodes.json', () => ({
    default: { field1: { label: 'Test Field' } },
}));

// Mock Vue components
vi.mock('../SomeComponent.vue', () => ({
    default: { template: '<div>Mocked Component</div>' },
}));
```

### 3. Pinia Stores

```typescript
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => {
    setActivePinia(createPinia());
});
```

## Best Practices

### 1. Test Organization

- Group related tests with `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Independence

- Each test should be independent and not rely on others
- Use `beforeEach` to reset state between tests
- Clear mocks between tests

### 3. What to Test

✅ **DO Test**:

- Public API of functions/classes
- Edge cases and error conditions
- Business logic and calculations
- State changes and side effects

❌ **DON'T Test**:

- Implementation details
- Third-party library internals
- Simple getters/setters without logic

### 4. Mocking Guidelines

- Mock external dependencies, not the code under test
- Keep mocks simple and focused
- Verify mock interactions when testing side effects

## Current Test Coverage

### ✅ Completed

- **NodeService**: 9 tests covering data transformation and export
- **useNodeStore**: 16 tests covering all store actions and state management

### 🚧 In Progress

- Component tests (WorkSpace, SubContainer, etc.)
- Integration tests
- E2E tests for critical user flows

### 📋 TODO

- Form validation tests
- Drag & drop interaction tests
- Error handling tests
- Performance tests for large datasets

## Continuous Integration

Tests run automatically on:

- Every commit (via Husky pre-commit hooks)
- Pull requests
- Deployment pipeline

## Debugging Tests

### Common Issues:

1. **Import errors**: Check file paths and mock configurations
2. **Async issues**: Use `await` for async operations
3. **Mock problems**: Ensure mocks are cleared between tests
4. **Environment issues**: Verify JSDOM setup for browser APIs

### Debugging Commands:

```bash
# Run with verbose output
npx vitest run --reporter=verbose

# Run single test with debugging
npx vitest run --reporter=verbose path/to/test.ts

# Check TypeScript compilation
npx tsc --noEmit path/to/test.ts
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Mocking Guide](https://jestjs.io/docs/mock-functions) (similar concepts apply to Vitest)
