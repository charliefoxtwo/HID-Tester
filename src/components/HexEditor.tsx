import { Box, SxProps, TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { Component, ReactNode } from "react";

const style: SxProps = {
    "& .MuiInputBase-input": {
        fontFamily: ["monospace"].join(","),
    },
};

export default class HexEditor extends Component<HexEditorProps, HexEditorState> {
    constructor(props: HexEditorProps) {
        super(props);

        this.state = { valid: true, text: "", rawText: "" };

        this.textInput = this.textInput.bind(this);
        this.callback = this.callback.bind(this);

        this.callback();
    }

    private isInLengthBounds(text: string): boolean {
        return (
            (this.props.maxBytes === undefined ? true : text.length <= this.maxTextLength * 2) && text.length % 2 === 0
        );
    }

    private isValidFormat(text: string): boolean {
        return new RegExp(/^[0-9a-fA-F]*$/).test(text);
    }

    private textInput(event: React.ChangeEvent<HTMLInputElement>): void {
        let rawText = event.target.value;
        const text = rawText.replaceAll(" ", "").replaceAll("\n", "");

        if (!this.isValidFormat(text) || (this.props.maxBytes && text.length > this.props.maxBytes * 2)) {
            this.setState({ rawText: this.state.rawText });
            return;
        } else if (text.length > 2) {
            if (text.length % 2 == 1 && rawText[rawText.length - 2] !== " ") {
                rawText = `${rawText.substring(0, rawText.length - 1)} ${rawText.substring(rawText.length - 1)}`;
            }
        } else if ((text.length % 2 === 1 || text.length === 0) && rawText.endsWith(" ")) {
            rawText = rawText.trimEnd();
        }

        rawText = text.match(/.{1,2}/g)?.join(" ") ?? "";
        this.setState(
            {
                text: text,
                rawText: rawText,
                valid: this.isInLengthBounds(text) && this.isValidFormat(text),
            },
            this.callback,
        );
    }

    private callback(): void {
        const textToUse = this.state.text.padEnd(this.maxTextLength, "0");
        const dataBuffer = textToUse.match(/.{1,2}/g)?.map(m => Number(`0x${m}`)) ?? [];
        this.props.onChange(this.state.valid, new Uint8Array(dataBuffer));
    }

    private get maxTextLength() {
        return this.props.maxBytes ?? 0;
    }
    /*
     * sample text:
     * 0000   02 66 07 00 00 00 00 b3 00 00 00 00 00 00 00 00
     * 0010   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
     * 0020   00 00 00 00 00 f0
     * */
    public render(): ReactNode {
        const { rawText, text } = this.state;
        const ghostText = "00";
        let ghostString = rawText;

        const totalUsefulChars = text.length;
        const remainingGhostBytes = (this.props.maxBytes ?? 0) - Math.ceil(totalUsefulChars / 2);

        ghostString =
            remainingGhostBytes < 0
                ? ""
                : `${ghostString}${
                      totalUsefulChars % 2 === 1 ? "0 " : rawText.endsWith(" ") || rawText.length === 0 ? "" : " "
                  }${Array(remainingGhostBytes).fill(ghostText).join(" ")}`;

        return (
            <Box sx={{ position: "relative" }}>
                <Grid2 xs={12} sx={{ zIndex: 1 }}>
                    <TextField
                        multiline
                        fullWidth
                        error={!this.state.valid}
                        spellCheck={false}
                        sx={style}
                        style={{ zIndex: 1 }}
                        onInput={this.textInput}
                        minRows={4}
                        value={this.state.rawText}
                    />
                </Grid2>
                <Grid2 xs={12} sx={{ zIndex: 0, position: "absolute", top: 0, right: 0 }}>
                    <TextField
                        multiline
                        fullWidth
                        error={!this.state.valid}
                        spellCheck={false}
                        sx={style}
                        onInput={this.textInput}
                        minRows={4}
                        disabled
                        style={{ zIndex: 0 }}
                        value={ghostString}
                    />
                </Grid2>
                <Box sx={{ position: "absolute", bottom: ".5rem", right: ".8rem" }}>
                    <Typography
                        sx={{
                            color: Math.floor(this.state.text.length / 2) === this.maxTextLength ? "primary" : "gray",
                        }}
                    >
                        <code>
                            {Math.floor(this.state.text.length / 2)}
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
    rawText: string;
}
