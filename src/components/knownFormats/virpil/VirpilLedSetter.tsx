import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { Component, ReactNode } from "react";

export default class VirpilLedSetter extends Component<VirpilDeviceProps, VirpilDeviceState> {
    constructor(props: VirpilDeviceProps) {
        super(props);
        this.state = { boardType: 0, ledNumber: 0, redPower: 0, greenPower: 0, bluePower: 0 };
        this.selectBoardType = this.selectBoardType.bind(this);
        this.selectLedNumber = this.selectLedNumber.bind(this);
        this.selectRedPower = this.selectRedPower.bind(this);
        this.selectGreenPower = this.selectGreenPower.bind(this);
        this.selectBluePower = this.selectBluePower.bind(this);
        this.update = this.update.bind(this);
    }

    public updateReportId(): void {
        this.props.reportId(0x02);
    }

    private updateBuffer(): void {
        const { boardType, ledNumber } = this.state;
        const buffer = new Uint8Array(37);
        buffer[0] = boardType;
        buffer[1] = this.commandId();
        buffer[ledNumber + 3] = this.colorByte();
        buffer[36] = 0xf0;

        this.props.dataBuffer(buffer);
    }

    private update() {
        this.updateReportId();
        this.updateBuffer();
    }

    private colorByte(): number {
        const { redPower, greenPower, bluePower } = this.state;
        let byte = 0b10000000;
        byte |= redPower;
        byte |= greenPower << 2;
        byte |= bluePower << 4;

        return byte;
    }

    private commandId(): number {
        const { boardType, ledNumber } = this.state;

        switch (boardType) {
            case 0x65:
                return ledNumber;
            case 0x66:
                return 4 + ledNumber;
            case 0x67:
                return 24 + ledNumber;
            case 0x68:
                return 44 + ledNumber;
            default:
                return 0;
        }
    }

    private selectBoardType(e: SelectChangeEvent) {
        this.setState({ boardType: Number(e.target.value) }, this.update);
    }

    private selectLedNumber(e: SelectChangeEvent) {
        this.setState({ ledNumber: Number(e.target.value) }, this.update);
    }

    private selectRedPower(e: SelectChangeEvent) {
        this.setState({ redPower: Number(e.target.value) }, this.update);
    }

    private selectGreenPower(e: SelectChangeEvent) {
        this.setState({ greenPower: Number(e.target.value) }, this.update);
    }

    private selectBluePower(e: SelectChangeEvent) {
        this.setState({ bluePower: Number(e.target.value) }, this.update);
    }

    public render(): ReactNode {
        return (
            <div>
                <Select label={"Board type"} onChange={this.selectBoardType}>
                    <MenuItem value={0x64}>Default</MenuItem>
                    <MenuItem value={0x65}>Add Board</MenuItem>
                    <MenuItem value={0x66}>On Board</MenuItem>
                    <MenuItem value={0x67}>Slave Board</MenuItem>
                    <MenuItem value={0x68}>Extra Board</MenuItem>
                </Select>
                <Select label={"LED number"} onChange={this.selectLedNumber}>
                    {/*<MenuItem value={0}>0</MenuItem>*/}
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={11}>11</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={13}>13</MenuItem>
                    <MenuItem value={14}>14</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={16}>16</MenuItem>
                    <MenuItem value={17}>17</MenuItem>
                    <MenuItem value={18}>18</MenuItem>
                    <MenuItem value={19}>19</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                </Select>
                <Select label={"Red power"} onChange={this.selectRedPower}>
                    <MenuItem value={0}>Off</MenuItem>
                    <MenuItem value={1}>25%</MenuItem>
                    <MenuItem value={2}>50%</MenuItem>
                    <MenuItem value={3}>100%</MenuItem>
                </Select>
                <Select label={"Green power"} onChange={this.selectGreenPower}>
                    <MenuItem value={0}>Off</MenuItem>
                    <MenuItem value={1}>25%</MenuItem>
                    <MenuItem value={2}>50%</MenuItem>
                    <MenuItem value={3}>100%</MenuItem>
                </Select>
                <Select label={"Blue power"} onChange={this.selectBluePower}>
                    <MenuItem value={0}>Off</MenuItem>
                    <MenuItem value={1}>25%</MenuItem>
                    <MenuItem value={2}>50%</MenuItem>
                    <MenuItem value={3}>100%</MenuItem>
                </Select>
            </div>
        );
    }
}

interface VirpilDeviceProps {
    reportId: (id: number) => void;
    dataBuffer: (buffer: Uint8Array) => void;
}

interface VirpilDeviceState {
    boardType: number;
    ledNumber: number;
    redPower: number;
    greenPower: number;
    bluePower: number;
}
