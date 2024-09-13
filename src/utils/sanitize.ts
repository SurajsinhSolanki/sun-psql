/**
 * Sanitizes user input to prevent XSS attacks by escaping special characters.
 *
 * @param {string} input - The user input to sanitize.
 * @returns {string} The sanitized input.
 */
export function sanitize(input: string): string {
    if (typeof input !== 'string') {
        return input;
    }

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
