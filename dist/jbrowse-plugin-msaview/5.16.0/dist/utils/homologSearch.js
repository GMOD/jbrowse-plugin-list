import { searchEbiBlast } from './ebiBlast';
import { searchEbiPhmmer } from './phmmer';
export const searchBackends = {
    blastp: searchEbiBlast,
    phmmer: searchEbiPhmmer,
};
