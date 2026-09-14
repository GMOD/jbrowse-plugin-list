import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { observer } from 'mobx-react';
import { entityLabel } from '../extractStructureSequences';
// Which chain the transcript maps to. The structure picks the protein chain
// the transcript explains most of, which cannot separate paralogs in a complex
// or the halves of a chimeric construct, so the choice is exposed for the
// cases it gets wrong.
const ChainSelect = observer(function ChainSelect({ model, }) {
    const { entities, mappedEntity, userProvidedTranscriptSequence } = model;
    if (!entities || entities.length < 2 || !userProvidedTranscriptSequence) {
        return null;
    }
    return (React.createElement(TextField, { select: true, size: "small", label: "Mapped chain", "data-testid": "protein-mapped-chain", value: mappedEntity?.entityId ?? '', onChange: event => {
            try {
                model.chooseEntity(event.target.value);
            }
            catch (e) {
                console.error(e);
                model.setError(e);
            }
        }, sx: { minWidth: 200, mr: 1 } }, entities.map(entity => (React.createElement(MenuItem, { key: entity.entityId, value: entity.entityId }, entityLabel(entity))))));
});
export default ChainSelect;
