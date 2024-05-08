export function extractLastNumberBeforeDot(inputString: string): number | null {
    const segments = inputString.split('.');

    for (let i = segments.length - 2; i >= 0; i--) {
        const numbers = segments[i].match(/(\d+)(?!.*\d)/);
        if (numbers && numbers[0]) {
            return parseInt(numbers[0], 10);
        }
    }

    return null;
}

export function extractNumberAfterLastDot(inputString: string): number | null {
    const segments = inputString.split('.');
    if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        const match = lastSegment.match(/\d+/);
        if (match) {
            return parseInt(match[0], 10);
        }
    }

    return null;
}
