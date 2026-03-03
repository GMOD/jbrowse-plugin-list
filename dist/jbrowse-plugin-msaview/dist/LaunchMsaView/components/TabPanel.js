import React from 'react';
// this is from MUI example
export default function TabPanel({ children, value, index, ...other }) {
    return (React.createElement("div", { role: "tabpanel", hidden: value !== index, ...other }, value === index && React.createElement("div", null, children)));
}
//# sourceMappingURL=TabPanel.js.map