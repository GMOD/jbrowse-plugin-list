import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()((theme) => ({
    formControl: {
        minWidth: 192,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));
function SelectBox({ selectList, selectedItem, handleSelect, label, helpText, }) {
    const { classes } = useStyles();
    return (_jsxs(FormControl, { className: classes.formControl, children: [_jsx(InputLabel, { children: label }), _jsx(Select, { value: selectedItem, onChange: handleSelect, label: helpText, children: selectList.map((item) => {
                    let value;
                    let description;
                    if (item.name) {
                        value = item.name;
                        description = `${item.name} (${item.synonyms.join(' ')})`;
                    }
                    return (_jsx(MenuItem, { value: value || item, children: description || item }, description || item));
                }) }), _jsx(FormHelperText, { children: helpText })] }));
}
export default SelectBox;
//# sourceMappingURL=SelectBox.js.map