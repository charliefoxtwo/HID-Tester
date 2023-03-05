import { InputType } from "./InputType";

export default interface InputValue {
    value: number;
    maxValue: number;
    name: string;
    type: InputType;
}
