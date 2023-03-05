import { List } from "@mui/material";
import React, { Component, ReactNode } from "react";

import DeviceListItem from "./DeviceListItem";

export default class DeviceList extends Component<DeviceListProps, DeviceListState> {
    constructor(props: DeviceListProps) {
        super(props);
        this.state = {};
        this.onSelection = this.onSelection.bind(this);
        this.onInputSelection = this.onInputSelection.bind(this);
    }

    // private async removeDevice(device: HIDDevice): Promise<void> {}

    private onSelection(device: HIDDevice, reportInfo: HIDReportInfo): void {
        this.setState({
            selectedDeviceVid: device.vendorId,
            selectedDevicePid: device.productId,
            selectedDeviceReportId: reportInfo?.reportId,
            inputSelected: false,
        });
        this.props.onSelection(device, reportInfo);
    }

    private onInputSelection(device: HIDDevice, inputInfos: HIDReportInfo[]): void {
        this.setState({
            selectedDeviceVid: device.vendorId,
            selectedDevicePid: device.productId,
            selectedDeviceReportId: undefined,
            inputSelected: true,
        });
        this.props.onInputSelection(device, inputInfos);
    }

    private get featureDevices(): HIDDevice[] {
        const { devices } = this.props;

        return devices.filter(d => d.collections.filter(c => c.featureReports?.length ?? 0 > 0).length > 0);
    }

    public render(): ReactNode {
        const { selectedDeviceVid, selectedDevicePid, selectedDeviceReportId, inputSelected } = this.state;

        return (
            <List sx={{ width: "100%" }}>
                {this.featureDevices.map((d, i) => (
                    <DeviceListItem
                        key={i}
                        device={d}
                        selectedDeviceReportId={
                            d.vendorId === selectedDeviceVid && d.productId === selectedDevicePid
                                ? selectedDeviceReportId
                                : undefined
                        }
                        inputSelected={
                            d.vendorId === selectedDeviceVid && d.productId === selectedDevicePid && inputSelected
                        }
                        onSelection={this.onSelection}
                        onInputSelection={this.onInputSelection}
                    />
                ))}
            </List>
        );
    }
}

interface DeviceListProps {
    devices: HIDDevice[];
    onSelection: (device: HIDDevice, reportInfo: HIDReportInfo) => void;
    onInputSelection: (device: HIDDevice, inputInfos: HIDReportInfo[]) => void;
}

interface DeviceListState {
    selectedDeviceVid?: number;
    selectedDevicePid?: number;
    selectedDeviceReportId?: number;
    inputSelected?: boolean;
}
