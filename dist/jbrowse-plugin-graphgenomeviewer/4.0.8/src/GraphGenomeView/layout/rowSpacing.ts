// Row pitch of the row layouts, in screen pixels rather than bp: a row holds a
// 10 px tube and an 11 px label whatever the window spans, so y is never
// scaled (LayoutResult.pixelRows) and rows past the pane are reached by panning.
// 20 px is the floor at which labels stop touching.
export const ROW_HEIGHT_PX = 20
