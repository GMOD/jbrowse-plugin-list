// The GBZ adapter's own refusal, marked regionTooLarge so core shows it as a
// zoom-in notice, or gbz-base's when it reaches the display unwrapped
export function isNodeLimitError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'NodeLimitError' ||
      (error as { regionTooLarge?: unknown }).regionTooLarge === true ||
      /reads more than nodeLimit|^Subgraph size limit of \d+ nodes exceeded/.test(
        error.message,
      ))
  )
}
