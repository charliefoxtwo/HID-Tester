import { Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

import GenericFeature from "./GenericFeature";

export default class FeatureReport extends Component<FeatureReportProps, FeatureReportState> {
    constructor(props: FeatureReportProps) {
        super(props);
        this.state = {
            buffer: new Uint8Array(),
            reportId: 0,
            valid: true,
        };

        this.reportData = this.reportData.bind(this);
    }

    private async sendFeatureReport(): Promise<void> {
        const { device } = this.props;
        const { reportId, buffer } = this.state;
        try {
            if (!device.opened) {
                await device.open();
            }
            console.log("sending", buffer);
            await this.props.device.sendFeatureReport(reportId, buffer);
        } catch (e) {
            console.error("unable to write feature report: ", e);
        }
    }

    private reportData(valid: boolean, reportId: number, buffer: Uint8Array) {
        this.setState({
            valid: valid,
            reportId: reportId,
            buffer: buffer,
        });
    }

    public render(): ReactNode {
        const { device, reportInfo } = this.props;

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
                <Grid2 xs={12}>
                    <GenericFeature reportData={this.reportData} reportInfo={reportInfo} />
                    {/*<VirpilLedSetter reportId={this.setReportId} dataBuffer={this.setDataBuffer} />*/}
                </Grid2>
                <Grid2 xs={12}>
                    <Button disabled={!this.state.valid} onClick={() => this.sendFeatureReport()} variant={"outlined"}>
                        Send feature report
                    </Button>
                </Grid2>
            </Grid2>
        );
    }
}

interface FeatureReportProps {
    device: HIDDevice;
    reportInfo: HIDReportInfo;
}

interface FeatureReportState {
    buffer: Uint8Array;
    reportId: number;
    valid: boolean;
}
