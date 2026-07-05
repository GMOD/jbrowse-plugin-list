import { type SvgIconProps } from '@mui/material';
import type { ApolloSessionModel } from '../session';
interface DownloadGFF3Props {
    session: ApolloSessionModel;
    handleClose(): void;
    assembly: string;
}
export declare function Export(props: SvgIconProps): import("react/jsx-runtime").JSX.Element;
export declare function DownloadGFF3({ handleClose, session, assembly: assemblyName, }: DownloadGFF3Props): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=DownloadGFF3.d.ts.map