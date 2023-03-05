import "./App.css";

import { Button, Link } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

import DeviceList from "./components/deviceList/DeviceList";
import FeatureReport from "./components/FeatureReport";
import Input from "./components/Input";
import InputMonitor from "./components/InputMonitor";
import { InputType } from "./components/InputType";
import Transformer from "./components/Transformer";

export default class App extends Component<unknown, AppState> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
        this.loadTheStuff = this.loadTheStuff.bind(this);
        this.clearTheStuff = this.clearTheStuff.bind(this);
        this.onSelection = this.onSelection.bind(this);
        this.onInputSelection = this.onInputSelection.bind(this);
    }

    public override componentDidMount() {
        try {
            navigator.hid.getDevices().then(d => this.setState({ devices: d }));

            if (!this.state.devices) return;

            Promise.all(this.state.devices?.map(d => d.open())).then(() => console.log("opened existing devices"));
        } catch (e) {
            console.error("Unable to retrieve devices (unsupported browser?)");
        }
    }

    private async loadTheStuff(): Promise<void> {
        const devices = await navigator.hid.requestDevice({
            filters: [],
        });

        console.log("devices", devices);

        this.setState({ devices: [...(this.state.devices ?? []), ...devices] });
    }

    private async clearTheStuff(): Promise<void> {
        await Promise.all(this.state.devices?.map(d => d.forget()) ?? []);
        this.setState({ devices: undefined });
    }

    private async onSelection(device: HIDDevice, reportInfo: HIDReportInfo): Promise<void> {
        if (device !== this.state.activeDevice) {
            await this.state.activeDevice?.close();
            if (!device.opened) {
                await device.open();
            }
        }
        this.setState({ activeDevice: device, activeReportInfo: reportInfo, activeInputItems: undefined });
    }

    private async onInputSelection(device: HIDDevice, inputInfos: HIDReportInfo[]): Promise<void> {
        if (device !== this.state.activeDevice) {
            await this.state.activeDevice?.close();
            if (!device.opened) {
                await device.open();
            }
        }

        const allItems = inputInfos.flatMap(i => i.items);
        let offsetBytes = 0;
        let startIndex = 0;

        const items: Input[] = [];

        for (const item of allItems) {
            const reportSize = item!.reportSize!;
            const slotSize = Math.ceil(reportSize / 8);

            const max =
                item?.usageMinimum && item.usageMaximum ? item.usageMaximum - item.usageMinimum : Number.MAX_VALUE;

            for (let i = 0; i < item!.reportCount! && i <= max; i += 1) {
                if (offsetBytes > 7) {
                    offsetBytes = 0;
                    startIndex += 1;
                }

                const endIndex = startIndex + slotSize - 1;
                const mask = [...Array(reportSize).keys()].map(k => 2 ** k).reduce((a, b) => a + b, 0);

                const t = new Transformer(startIndex, endIndex, mask, offsetBytes);
                offsetBytes += reportSize;
                startIndex = endIndex;

                let name = `${i + 1}`;
                let type = InputType.Digital;
                const usage = item?.usages?.[0];
                switch (usage) {
                    case 65584:
                        name = "X";
                        type = InputType.Analogue;
                        break;
                    case 65585:
                        name = "Y";
                        type = InputType.Analogue;
                        break;
                    case 65586:
                        name = "Z";
                        type = InputType.Analogue;
                        break;
                    case 65587:
                        name = "Rx";
                        type = InputType.Analogue;
                        break;
                    case 65588:
                        name = "Ry";
                        type = InputType.Analogue;
                        break;
                    case 65589:
                        name = "Rz";
                        type = InputType.Analogue;
                        break;
                    case 65590:
                        name = "Slider";
                        type = InputType.Analogue;
                        break;
                    case 65591:
                        name = "Dial";
                        type = InputType.Analogue;
                        break;
                }

                let maxSize = item?.logicalMaximum;
                if (!maxSize || maxSize == 0) maxSize = reportSize;
                items.push(new Input(t, name, maxSize, type));
            }
            startIndex += 1;
            offsetBytes = 0;
        }

        this.setState({ activeDevice: device, activeReportInfo: undefined, activeInputItems: items });
    }

    public render(): ReactNode {
        const { activeDevice, activeReportInfo, activeInputItems, devices } = this.state;
        return (
            <div className="App">
                <div className="App-header">
                    <p>
                        Using a Chromium-based browser (such as Chrome, Edge, Opera, etc.) is{" "}
                        <Link href={"https://caniuse.com/mdn-api_hiddevice_sendfeaturereport"} underline={"none"}>
                            required
                        </Link>
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
                            <DeviceList
                                devices={devices ?? []}
                                onSelection={this.onSelection}
                                onInputSelection={this.onInputSelection}
                            />
                        </Grid2>
                        <Grid2 xs={12} md={8} lg={9}>
                            {activeDevice && activeReportInfo && (
                                <FeatureReport device={activeDevice} reportInfo={activeReportInfo} />
                            )}
                            {activeDevice && activeInputItems && (
                                <InputMonitor device={activeDevice} inputItems={activeInputItems} />
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
    activeInputItems?: Input[];
}
