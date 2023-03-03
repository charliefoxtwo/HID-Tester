import { Typography } from "@mui/material";
import React, { Component, ReactNode } from "react";

import HexEditor from "./HexEditor";

export default class GenericFeature extends Component<GenericFeatureProps, GenericFeatureState> {
    constructor(props: GenericFeatureProps) {
        super(props);
        this.state = { valid: true };
        this.update = this.update.bind(this);
    }

    private update(valid: boolean, buffer: Uint8Array) {
        this.props.reportData(valid, this.props.reportInfo.reportId!, buffer);
    }

    private get reportItem(): HIDReportItem {
        return this.props.reportInfo.items!.filter(i => i.isConstant === false)[0];
    }

    public render(): ReactNode {
        return (
            <>
                <Typography>Enter the payload (in hex) to send to the device below.</Typography>
                <HexEditor maxBytes={this.reportItem.reportCount} onChange={this.update} />
            </>
        );
    }
}

interface GenericFeatureProps {
    reportData: (valid: boolean, reportId: number, dataBuffer: Uint8Array) => void;
    reportInfo: HIDReportInfo;
}

interface GenericFeatureState {
    valid: boolean;
}
