import type { ApolloSessionModel } from '../../session';
import type { Coord } from '../../util/displayUtils';
interface LinearApolloDisplayProps {
    mouseCooordinate: Coord | undefined;
    session: ApolloSessionModel;
    dragging: boolean;
}
export declare const Tooltip: (props: LinearApolloDisplayProps) => import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=Tooltip.d.ts.map