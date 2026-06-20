export type UUID = string & { readonly __brand: unique symbol };

export function isUUID(value: string): value is UUID {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export function toUUID(value: string): UUID {
    if (!isUUID(value)) {
        throw new Error(`Invalid UUID format string: ${value}`);
    }
    return value as UUID;
}