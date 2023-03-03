import { Component } from "react";

export default class FeatureReportClass<S> extends Component<ComponentProps, S> {}

interface ComponentProps {
    reportId: (id: number) => void;
    dataBuffer: (buffer: Uint8Array) => void;
}
