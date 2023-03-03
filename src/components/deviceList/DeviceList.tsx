import { List } from "@mui/material";
import React, { Component, ReactNode } from "react";

import DeviceListItem from "./DeviceListItem";

export default class DeviceList extends Component<DeviceListProps, DeviceListState> {
    constructor(props: DeviceListProps) {
        super(props);
        this.state = {};
        this.onSelection = this.onSelection.bind(this);
    }

    // private async removeDevice(device: HIDDevice): Promise<void> {}

    private onSelection(device: HIDDevice, reportInfo: HIDReportInfo): void {
        this.setState({
            selectedDeviceVid: device.vendorId,
            selectedDevicePid: device.productId,
            selectedDeviceReportId: reportInfo.reportId!,
        });
        this.props.onSelection(device, reportInfo);
    }

    public render(): ReactNode {
        const { devices } = this.props;
        const { selectedDeviceVid, selectedDevicePid, selectedDeviceReportId } = this.state;

        return (
            <List sx={{ width: "100%" }}>
                {devices.map((d, i) => (
                    <DeviceListItem
                        key={i}
                        device={d}
                        selectedDeviceReportId={
                            d.vendorId === selectedDeviceVid && d.productId === selectedDevicePid
                                ? selectedDeviceReportId
                                : undefined
                        }
                        onSelection={this.onSelection}
                    />
                ))}
            </List>
        );
    }
}

interface DeviceListProps {
    devices: HIDDevice[];
    onSelection: (device: HIDDevice, reportInfo: HIDReportInfo) => void;
}

interface DeviceListState {
    selectedDeviceVid?: number;
    selectedDevicePid?: number;
    selectedDeviceReportId?: number;
}
