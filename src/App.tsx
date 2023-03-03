import "./App.css";

import { Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

import DeviceList from "./components/deviceList/DeviceList";
import FeatureReport from "./components/FeatureReport";

export default class App extends Component<unknown, AppState> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
        this.loadTheStuff = this.loadTheStuff.bind(this);
        this.clearTheStuff = this.clearTheStuff.bind(this);
        this.onSelection = this.onSelection.bind(this);
    }

    public override componentDidMount() {
        navigator.hid.getDevices().then(d => this.setState({ devices: d }));

        if (!this.state.devices) return;

        Promise.all(this.state.devices?.map(d => d.open())).then(x => console.log("opened existing devices"));
    }

    private async loadTheStuff(): Promise<void> {
        const filters: HIDDeviceFilter[] = [];

        const devices = (
            await navigator.hid.requestDevice({
                filters: filters,
            })
        ).filter(d => d.collections.filter(c => c.featureReports?.length ?? 0 > 0).length > 0);

        if (devices.length > 1) {
            console.warn("got multiple devices");
        } else if (devices.length == 0) {
            console.warn("got no devices");
        }

        this.setState({ devices: [...(this.state.devices ?? []), ...devices] });
        console.log(`added ${devices.length} devices`);
    }

    private async clearTheStuff(): Promise<void> {
        await Promise.all(this.state.devices?.map(d => d.forget()) ?? []);
        this.setState({ devices: undefined });
    }

    private removeDevice(device: HIDDevice) {
        this.setState({ devices: this.state.devices?.filter(d => d.opened) });
    }

    private onSelection(device: HIDDevice, reportInfo: HIDReportInfo): void {
        this.setState({ activeDevice: device, activeReportInfo: reportInfo });
    }

    public render(): ReactNode {
        const { activeDevice, activeReportInfo, devices } = this.state;
        return (
            <div className="App">
                <div className="App-header">
                    <p>
                        Using a Chromium-based browser (such as Chrome, Edge, Opera, etc.) is{" "}
                        <a href={"https://caniuse.com/mdn-api_hiddevice_sendfeaturereport"}>
                            <b>required</b>
                        </a>
                        .
                    </p>
                    <Grid2 container spacing={2} width={"100%"}>
                        <Grid2 container xs={12} md={4} lg={3}>
                            <Grid2 xs={12}>
                                <Button fullWidth variant={"outlined"} onClick={this.loadTheStuff}>
                                    Add a device
                                </Button>
                            </Grid2>
                            <Grid2 xs={12}>
                                <Button fullWidth variant={"outlined"} color={"error"} onClick={this.clearTheStuff}>
                                    Clear devices
                                </Button>
                            </Grid2>
                            <DeviceList devices={devices ?? []} onSelection={this.onSelection} />
                        </Grid2>
                        <Grid2 xs={12} md={8} lg={9}>
                            {activeDevice && activeReportInfo && (
                                <FeatureReport device={activeDevice} reportInfo={activeReportInfo} />
                            )}
                        </Grid2>
                    </Grid2>
                </div>
            </div>
        );
    }
}

interface AppState {
    devices?: HIDDevice[];
    activeDevice?: HIDDevice;
    activeReportInfo?: HIDReportInfo;
}
