// `session.views`, `session.hovered` and a display's members are read
// structurally, their types being the host's rather than this plugin's
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
