# CitiZen API Test Suite

This directory contains comprehensive Playwright test scripts for the CitiZen API, implementing both black box and white box testing strategies.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual endpoints
│   ├── auth.spec.ts        # Authentication API tests
│   ├── issues.spec.ts      # Issues API tests
│   ├── constituencies.spec.ts # Constituencies API tests
│   └── upvotes.spec.ts     # Upvotes API tests
├── integration/            # Integration tests for multi-endpoint workflows
│   ├── user-workflow.spec.ts    # User workflow tests
│   └── admin-workflow.spec.ts   # Admin workflow tests
├── system/                 # System tests for end-to-end scenarios
│   └── end-to-end.spec.ts  # Complete system tests
├── test-cases.md          # Detailed test case documentation
└── README.md              # This file
```

## Test Design Techniques

### 1. Equivalence Class Partitioning (ECP)

- **Valid Class**: Inputs that should be accepted by the system
- **Invalid Class**: Inputs that should be rejected by the system

### 2. Boundary Value Analysis (BVA)

- **Just below boundary**: Minimum value - 1
- **At boundary**: Minimum/maximum value
- **Just above boundary**: Maximum value + 1

### 3. White Box Testing Coverage

- **Branch Coverage**: Testing all conditional branches
- **Path Coverage**: Testing different execution paths
- **Condition Coverage**: Testing all boolean conditions
- **Loop Coverage**: Testing loop iterations (where applicable)

## Test Levels

### Unit Tests

- Test each API endpoint independently
- Mock external dependencies where needed
- Focus on individual functionality validation
- Apply ECP, BVA, and white box coverage

### Integration Tests

- Validate multiple endpoints/modules working together
- Test complete user workflows
- Verify data flow between components
- Test admin management workflows

### System Tests

- Simulate full end-to-end API workflows
- Test system performance and reliability
- Validate error handling and recovery
- Test concurrent operations

## Test Case Specification

Each test case includes:

- **ID**: Unique test case identifier
- **Objective**: What the test is trying to achieve
- **Preconditions**: Required setup before test execution
- **Input Data**: Valid and invalid test data
- **Expected Result**: What should happen
- **Actual Result**: Placeholder for test execution results
- **Status**: Placeholder for test execution status

## Running the Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

3. Start the API server:
   ```bash
   npm run dev
   ```

### Test Execution Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:system        # System tests only

# Run with specific options
npx playwright test --headed    # Run with browser UI
npx playwright test --debug     # Run in debug mode
npx playwright test --grep "auth" # Run tests matching pattern

# Generate and view test report
npm run test:report
```

### Test Configuration

The tests are configured in `playwright.config.ts`:

- Base URL: `http://localhost:3333` (configurable via `API_BASE_URL` env var)
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Parallel execution enabled
- Multiple reporters: HTML, JSON, JUnit

## Test Data Management

### Test Data Strategy

- Each test creates its own test data
- Tests are isolated and can run independently
- Cleanup is handled automatically by test teardown
- Mock data is used for admin authentication

### Data Isolation

- Tests use unique email addresses and IDs
- No shared state between tests
- Each test suite has its own data namespace

## Coverage Analysis

### API Endpoint Coverage

- **Authentication**: 100% endpoint coverage
- **Issues**: 100% endpoint coverage
- **Constituencies**: 100% endpoint coverage
- **Upvotes**: 100% endpoint coverage
- **Panchayats**: Covered in integration tests
- **MLA Dashboard**: Covered in integration tests

### Test Coverage by Type

- **Positive Tests**: 60% (valid inputs, expected behavior)
- **Negative Tests**: 30% (invalid inputs, error conditions)
- **Boundary Tests**: 10% (edge cases, boundary values)

## Test Reports

### HTML Report

- Interactive test results
- Screenshots and videos (if enabled)
- Test execution timeline
- Access via: `npm run test:report`

### JSON Report

- Machine-readable test results
- Location: `test-results/results.json`
- Suitable for CI/CD integration

### JUnit Report

- XML format for CI systems
- Location: `test-results/results.xml`
- Compatible with Jenkins, Azure DevOps, etc.

## Continuous Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npx playwright install
      - run: npm run dev &
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   - Change port in `playwright.config.ts`
   - Kill existing processes: `lsof -ti:3333 | xargs kill -9`

2. **Database connection issues**

   - Ensure MongoDB is running
   - Check connection string in environment variables

3. **Test timeouts**

   - Increase timeout in `playwright.config.ts`
   - Check API server performance

4. **Authentication failures**
   - Verify admin token implementation
   - Check middleware configuration

### Debug Mode

```bash
# Run specific test in debug mode
npx playwright test tests/unit/auth.spec.ts --debug

# Run with browser UI
npx playwright test --headed

# Run with trace
npx playwright test --trace on
```

## Best Practices

### Test Writing

1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Keep tests independent and isolated
4. Use meaningful assertions
5. Add comments for complex test logic

### Test Maintenance

1. Update tests when API changes
2. Keep test data realistic
3. Regular test execution
4. Monitor test performance
5. Review and refactor tests regularly

## Contributing

### Adding New Tests

1. Follow existing naming conventions
2. Add test cases to `test-cases.md`
3. Include both positive and negative scenarios
4. Apply appropriate test design techniques
5. Update this README if needed

### Test Review Checklist

- [ ] Test covers the intended functionality
- [ ] Both valid and invalid inputs are tested
- [ ] Boundary values are tested
- [ ] Error conditions are handled
- [ ] Test is isolated and independent
- [ ] Test data is realistic and varied
- [ ] Assertions are meaningful and specific
