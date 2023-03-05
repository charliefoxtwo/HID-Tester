import { InputType } from "./InputType";
import Transformer from "./Transformer";

export default class Input {
    constructor(
        private readonly _transformer: Transformer,
        private readonly _name: string,
        private readonly _maxValue: number,
        private readonly _type: InputType,
    ) {}

    public get transformer(): Transformer {
        return this._transformer;
    }

    public get name(): string {
        return this._name;
    }

    public get maxValue(): number {
        return this._maxValue;
    }

    public get type(): InputType {
        return this._type;
    }
}
