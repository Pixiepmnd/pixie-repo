# Contributing to Pixie

Thank you for your interest in contributing to Pixie! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to professional standards. By participating, you agree to maintain a respectful and collaborative environment.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- Rust >= 1.70.0 (for Rust components)
- npm >= 9.0.0

### Installation

```bash
git clone https://github.com/pixie/pixie-repo.git
cd pixie-repo
npm install
```

### Build

```bash
# Build TypeScript
npm run build:ts

# Build Rust components
npm run build:rust

# Build all
npm run build
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Tests
- `chore/` - Maintenance

### 2. Make Changes

- Write clean, maintainable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Commit Guidelines

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance
- `perf`: Performance

Examples:

```bash
git commit -m "feat(nlp): add support for multi-language parsing"
git commit -m "fix(wallet): resolve balance calculation edge case"
git commit -m "docs(readme): update installation instructions"
```

### 4. Testing

All tests must pass:

```bash
npm run lint              # Check code style
npm run type-check        # TypeScript validation
npm test                  # Run tests
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Follow conventional commits format:

```
type(scope): description
```

### PR Description

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests passing
```

## Code Style

### TypeScript

```typescript
// Use explicit types
function processData(input: string): ProcessedData {
  // Implementation
}

// Use const for immutable values
const MAX_RETRIES = 3;

// Use descriptive names
const userAuthenticationToken = generateToken();

// Async/await over promises
async function fetchData(): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}
```

### Rust

```rust
// Use descriptive names
pub fn parse_intent_fast(input: &str) -> ParsedIntent {
    // Implementation
}

// Document public APIs
/// Validates a Solana address
/// 
/// # Arguments
/// * `address` - The address string to validate
/// 
/// # Returns
/// `true` if valid, `false` otherwise
pub fn validate_address(address: &str) -> bool {
    // Implementation
}
```

## Testing Guidelines

### Unit Tests

```typescript
describe('NLPParser', () => {
  it('should parse send intent correctly', async () => {
    const result = await parser.parseIntent('send 5 SOL');
    expect(result.action).toBe(IntentAction.SEND_TOKEN);
    expect(result.entities.amount).toBe(5);
  });
});
```

### Integration Tests

```typescript
describe('Wallet Integration', () => {
  it('should complete full transaction flow', async () => {
    const result = await client.executeTransaction(intent);
    expect(result.status).toBe('success');
  });
});
```

## Documentation

- Use clear, technical language
- Provide code examples
- Document edge cases
- Keep docs up-to-date

## Security

- Never commit secrets or private keys
- Use environment variables
- Follow secure coding practices
- Report vulnerabilities privately

## Questions?

- Check existing issues
- Create new issue for bugs
- Start discussion for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
