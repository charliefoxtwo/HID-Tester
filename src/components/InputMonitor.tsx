import { Chip, Theme, Tooltip } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

import Input from "./Input";
import { InputType } from "./InputType";
import InputValue from "./InputValue";

export default class InputMonitor extends Component<InputMonitorProps, InputMonitorState> {
    constructor(props: InputMonitorProps) {
        super(props);

        this.onInput = this.onInput.bind(this);

        this.state = {
            inputValues: [],
            lastData: new Uint8Array(),
        };
    }

    override componentDidUpdate(prevProps: Readonly<InputMonitorProps>) {
        if (prevProps.device === this.props.device) return;

        prevProps.device.oninputreport = null;

        // prevProps.device.removeEventListener("inputreport", this.onInput);
        this.props.device.addEventListener("inputreport", this.onInput);
    }

    override componentDidMount() {
        this.props.device.addEventListener("inputreport", this.onInput);
    }

    override componentWillUnmount() {
        this.props.device.removeEventListener("inputreport", this.onInput);
    }

    private onInput(event: HIDInputReportEvent): void {
        const { lastData } = this.state;
        const { inputItems } = this.props;

        const dataAsArray = new Uint8Array(event.data.buffer);
        if (dataAsArray.join("") === lastData.join("")) return;

        const results: InputValue[] = [];

        for (const item of inputItems) {
            const v = item.transformer.getValue(dataAsArray);
            results.push({ value: v, maxValue: item.maxValue, name: item.name, type: item.type });
        }

        this.setState({ inputValues: results, lastData: dataAsArray });
    }

    public render(): ReactNode {
        const { device } = this.props;
        const { inputValues } = this.state;

        return (
            <Grid2 container justifyContent={"space-between"}>
                <Grid2 xs={12} md={"auto"} alignContent={"left"}>
                    <code>
                        {("0000" + device.vendorId.toString(16)).slice(-4)}::
                        {("0000" + device.productId.toString(16)).slice(-4)}
                    </code>
                </Grid2>
                <Grid2 xs={12} md={"auto"} alignContent={"right"}>
                    {device.productName}
                </Grid2>

                <Grid2 container xs={12}>
                    {inputValues.map(v => {
                        switch (v.type) {
                            case InputType.Analogue:
                                return (
                                    <Grid2 xs={12} sm={6} md={4} lg={3} key={v.name}>
                                        <Tooltip title={v.name}>
                                            <Chip
                                                label={`${v.name}: ${v.value}`}
                                                color={"primary"}
                                                variant={v.value > 0 ? "filled" : "outlined"}
                                                sx={(theme: Theme) => ({
                                                    width: "100%",
                                                    backgroundColor: `${theme.palette.primary.main}${Math.round(
                                                        (v.value / v.maxValue) * 256,
                                                    )

                                                        .toString(16)
                                                        .padStart(2, "0")}}`,
                                                })}
                                            />
                                        </Tooltip>
                                    </Grid2>
                                );
                            case InputType.Digital:
                                return (
                                    <Grid2 xs={4} sm={3} md={2} lg={1.5} key={v.name}>
                                        <Tooltip title={v.name}>
                                            <Chip
                                                label={v.name}
                                                color={"primary"}
                                                variant={v.value > 0 ? "filled" : "outlined"}
                                            />
                                        </Tooltip>
                                    </Grid2>
                                );
                            default:
                                return <></>;
                        }
                    })}
                </Grid2>
            </Grid2>
        );
    }
}

interface InputMonitorProps {
    device: HIDDevice;
    inputItems: Input[];
}

interface InputMonitorState {
    inputValues: InputValue[];
    lastData: Uint8Array;
}
