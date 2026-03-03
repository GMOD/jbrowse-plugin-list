import { SelectChangeEvent } from '@mui/material';
declare function SelectBox({ selectList, selectedItem, handleSelect, label, helpText, }: {
    selectList: any[];
    selectedItem: any;
    label: string;
    helpText: string;
    handleSelect: (evt: SelectChangeEvent) => void;
}): JSX.Element;
export default SelectBox;
