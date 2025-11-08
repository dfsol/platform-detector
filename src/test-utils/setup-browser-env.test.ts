import { Window } from 'happy-dom';

const globalScope = globalThis as typeof globalThis & {
    __PLATFORM_DETECTOR_DOM__?: boolean;
    matchMedia?: typeof window.matchMedia;
};

if (typeof globalScope.window === 'undefined' || !globalScope.__PLATFORM_DETECTOR_DOM__) {
    const happyWindow = new Window();
    const happyDocument = happyWindow.document;
    const happyNavigator = happyWindow.navigator;

    globalScope.window = happyWindow as unknown as typeof window;
    globalScope.document = happyDocument as typeof document;
    globalScope.navigator = happyNavigator as typeof navigator;
    globalScope.location = happyWindow.location;
    globalScope.history = happyWindow.history;
    globalScope.screen = happyWindow.screen;
    globalScope.performance = happyWindow.performance;
    globalScope.HTMLElement = happyWindow.HTMLElement;
    globalScope.Node = happyWindow.Node;
    globalScope.CustomEvent = happyWindow.CustomEvent;
    globalScope.getComputedStyle = happyWindow.getComputedStyle.bind(happyWindow);
    globalScope.requestAnimationFrame = happyWindow.requestAnimationFrame.bind(happyWindow);
    globalScope.cancelAnimationFrame = happyWindow.cancelAnimationFrame.bind(happyWindow);

    const matchMediaImpl =
        happyWindow.matchMedia ||
        ((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }));

    globalScope.matchMedia = matchMediaImpl.bind(happyWindow);

    if (typeof happyNavigator.maxTouchPoints === 'undefined') {
        Object.defineProperty(happyNavigator, 'maxTouchPoints', {
            value: 0,
            configurable: true,
        });
    }

    if (typeof (happyNavigator as any).userAgent === 'undefined') {
        Object.defineProperty(happyNavigator, 'userAgent', {
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            configurable: true,
        });
    }

    globalScope.__PLATFORM_DETECTOR_DOM__ = true;
}
