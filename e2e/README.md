# E2E Tests (Detox)

## Prerequisites

1. **Build the app**: Run `npx expo prebuild` then `npx expo run:ios` to create the native iOS project and build
2. **Firebase Emulator Suite** (optional): For isolated auth/data testing
3. **Add testIDs** to key elements in the app for reliable selection

## Running E2E Tests

```bash
# Build the app first
npx expo prebuild
npx expo run:ios --configuration Debug

# Run E2E tests
npm run test:e2e
```

## Config

- `.detoxrc.js` - Detox configuration
- `e2e/jest.config.js` - Jest config for E2E
- `e2e/init.js` - Detox init and adapter setup
