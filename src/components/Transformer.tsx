export default class Transformer {
    constructor(
        private readonly startIndex: number,
        private readonly endIndex: number,
        private readonly mask: number,
        private readonly shift: number,
    ) {}

    public getValue(buffer: Uint8Array): number {
        return (
            ([...buffer.values()]
                .slice(this.startIndex, this.endIndex + 1)
                .map((n, i) => n << (8 * i))
                .reduce((a, b) => a + b, 0) >>
                this.shift) &
            this.mask
        );
    }
}
