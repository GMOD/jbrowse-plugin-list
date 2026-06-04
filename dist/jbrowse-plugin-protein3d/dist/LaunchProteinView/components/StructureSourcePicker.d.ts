import React from 'react';
export default function StructureSourcePicker({ choice, setChoice, structureURL, setStructureURL, file: _file, setFile, pdbId, setPdbId, }: {
    choice: string;
    setChoice: (c: string) => void;
    structureURL: string;
    setStructureURL: (url: string) => void;
    file: File | undefined;
    setFile: (f: File) => void;
    pdbId: string;
    setPdbId: (id: string) => void;
}): React.JSX.Element;
