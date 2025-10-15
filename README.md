# @dfsol/platform-detector

Universal platform detector for web, PWA, Telegram Mini Apps, and native mobile applications.

## Features

- 🌐 **Web Platform Detection**: Desktop (macOS, Windows, Linux) and mobile (iOS, Android)
- 📱 **PWA Detection**: Identifies installed Progressive Web Apps
- 🤖 **Telegram Mini App**: Detects TMA environment
- 📲 **Native App Detection**: Recognizes Capacitor/Cordova apps
- 🔀 **Domain Mode**: Distinguishes between `app.*` and `tg.*` domains
- ⚠️ **TMA Mismatch Warning**: Automatic detection when TMA domain is accessed outside Telegram
- 🎨 **Svelte Component**: Ready-to-use TMA redirect page

## Installation

```bash
bun add @dfsol/platform-detector
```

## Quick Start

```typescript
import { detectPlatform } from '@dfsol/platform-detector';

const platform = detectPlatform();

if (platform.shouldShowTMAWarning) {
  // Show TMA redirect page
}
```

## Documentation

See full documentation in package README.

## License

MIT
