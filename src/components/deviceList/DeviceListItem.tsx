import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import React, { Component, ReactNode } from "react";

export default class DeviceListItem extends Component<DeviceListItemProps, DeviceListItemState> {
    constructor(props: DeviceListItemProps) {
        super(props);
        this.state = {
            open: false,
        };
        this.toggleOpen = this.toggleOpen.bind(this);
    }

    public toggleOpen(): void {
        this.setState({ open: !this.state.open });
    }

    private static notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

    private get reportsToUse(): HIDReportInfo[] {
        return this.props.device.collections
            .filter(c => c.featureReports?.length ?? 0 > 0)
            .flatMap(c => c.featureReports)
            .filter(DeviceListItem.notEmpty);
    }

    private get inputsToUse(): HIDReportInfo[] {
        return this.props.device.collections.flatMap(c => c.inputReports ?? []).filter(DeviceListItem.notEmpty);
    }

    public render(): ReactNode {
        const { device, onSelection } = this.props;
        const { open } = this.state;
        return (
            <>
                <ListItemButton
                    // secondaryAction={
                    //     <IconButton edge="end" aria-label="delete" onClick={() => this.removeDevice(device)}>
                    //         <Delete />
                    //     </IconButton>
                    // }
                    onClick={this.toggleOpen}
                >
                    <ListItemText primary={device.productName} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {/*<ListItemButton*/}
                        {/*    sx={{ pl: 4 }}*/}
                        {/*    selected={this.props.selectedDeviceReportId === -1}*/}
                        {/*    onClick={() => onSelection(device, { reportId: -1, items: [] })}*/}
                        {/*>*/}
                        {/*    <ListItemText primary={"Custom"} />*/}
                        {/*</ListItemButton>*/}
                        {this.inputsToUse.length > 0 && (
                            <ListItemButton
                                selected={this.props.inputSelected}
                                sx={{ pl: 4 }}
                                onClick={() => this.props.onInputSelection(device, this.inputsToUse)}
                            >
                                <ListItemText primary={`View inputs`} />
                            </ListItemButton>
                        )}
                        {this.reportsToUse.map((r, i) => (
                            <ListItemButton
                                key={i}
                                selected={this.props.selectedDeviceReportId === r.reportId}
                                sx={{ pl: 4 }}
                                onClick={() => onSelection(device, r)}
                            >
                                <ListItemText primary={`Feature 0x${("00" + r.reportId?.toString(16)).slice(-2)}`} />
                            </ListItemButton>
                        ))}
                        {this.reportsToUse.length === 0 && (
                            <ListItemButton sx={{ pl: 4 }} disabled={true}>
                                <ListItemText primary={"No features found"} />
                            </ListItemButton>
                        )}
                    </List>
                </Collapse>
            </>
        );
    }
}

interface DeviceListItemProps {
    device: HIDDevice;
    onSelection: (device: HIDDevice, reportInfo: HIDReportInfo) => void;
    onInputSelection: (device: HIDDevice, inputInfo: HIDReportInfo[]) => void;
    selectedDeviceReportId?: number;
    inputSelected?: boolean;
}

interface DeviceListItemState {
    open: boolean;
}
