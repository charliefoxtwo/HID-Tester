import { Box, SxProps, TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

const style: SxProps = {
    font: "monospace 18px white",
};

export default class HexEditor extends Component<HexEditorProps, HexEditorState> {
    constructor(props: HexEditorProps) {
        super(props);

        this.state = { valid: props.maxBytes === undefined, text: "" };

        this.textInput = this.textInput.bind(this);
        this.callback = this.callback.bind(this);

        this.callback();
    }

    private isInLengthBounds(text: string): boolean {
        return this.props.maxBytes === undefined ? true : text.length === this.maxTextLength;
    }

    private isValidFormat(text: string): boolean {
        return new RegExp(/^[0-9a-fA-F]*$/).test(text);
    }

    private textInput(event: React.ChangeEvent<HTMLInputElement>): void {
        const text = event.target.value.replaceAll(" ", "").replaceAll("\n", "");
        this.setState({ text: text, valid: this.isInLengthBounds(text) && this.isValidFormat(text) }, this.callback);
    }

    private callback(): void {
        const textToUse = this.state.text.padEnd(this.maxTextLength, "0");
        const dataBuffer = textToUse.match(/.{1,2}/g)?.map(m => Number(`0x${m}`)) ?? [];
        this.props.onChange(this.state.valid, new Uint8Array(dataBuffer));
    }

    private get maxTextLength() {
        return (this.props.maxBytes ?? 0) * 2;
    }
    /*
     * sample text:
     * 0000   02 66 07 00 00 00 00 b3 00 00 00 00 00 00 00 00
     * 0010   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
     * 0020   00 00 00 00 00 f0
     * */
    public render(): ReactNode {
        return (
            <Box sx={{ position: "relative" }}>
                <Grid2 xs={12}>
                    <TextField
                        multiline
                        fullWidth
                        error={!this.state.valid}
                        spellCheck={false}
                        sx={style}
                        onInput={this.textInput}
                        minRows={4}
                    />
                </Grid2>
                <Box sx={{ position: "absolute", bottom: ".5rem", right: ".8rem" }}>
                    <Typography sx={{ color: "gray" }}>
                        <code>
                            {this.state.text.length}
                            {this.props.maxBytes !== undefined && `/${this.maxTextLength}`}
                        </code>
                    </Typography>
                </Box>
            </Box>
        );
    }
}

interface HexEditorProps {
    maxBytes?: number;
    onChange: (valid: boolean, buffer: Uint8Array) => void;
}

interface HexEditorState {
    valid: boolean;
    text: string;
}
