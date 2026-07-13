export class EnumMapper<T extends string> {
    constructor(private readonly enumObject: Record<string, T>) { }

    fromString(value: string): T {
        const normalized = value.toUpperCase();

        if (!this.isValid(normalized)) {
            throw new Error(`Invalid value: ${value}`);
        }

        return normalized as T;
    }

    private isValid(value: string): boolean {
        return Object.values(this.enumObject).includes(value as T);
    }
}