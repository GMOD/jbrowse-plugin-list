import type { InMemoryFileDriver } from '../BackendDrivers';
import type { ApolloSessionModel } from '../session';
interface OpenLocalFileProps {
    session: ApolloSessionModel;
    handleClose(): void;
    inMemoryFileDriver: InMemoryFileDriver;
}
export interface RefSeqInterface {
    refName: string;
    uniqueId: string;
    aliases?: string[];
}
export declare function OpenLocalFile({ handleClose, session }: OpenLocalFileProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=OpenLocalFile.d.ts.map