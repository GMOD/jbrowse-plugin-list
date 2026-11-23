import { vi } from 'vitest'

import type { readConfObject } from '@jbrowse/core/configuration'

export const mockRpcCall = vi.fn()
// The canonical assembly a name or alias resolves to, which is what
// assemblyManager.assemblyNameMap does: it is keyed by [name, ...aliases].
function canonicalAssembly(name: string) {
  const aliased = mockSession.assemblyAliases[name]
  return mockSession.assemblyNames.includes(name)
    ? name
    : aliased !== undefined && mockSession.assemblyNames.includes(aliased)
      ? aliased
      : undefined
}
function aliasesOf(name: string) {
  return Object.keys(mockSession.assemblyAliases).filter(
    alias => mockSession.assemblyAliases[alias] === name,
  )
}
export const mockSession = {
  tracks: [] as { trackId: string; [key: string]: unknown }[],
  rpcManager: { call: mockRpcCall },
  assemblyNames: [] as string[],
  // alias -> the assembly it names, the half of assemblyManager a graph needs:
  // a node's PanSN sample is the graph's spelling, not necessarily the
  // assembly's
  assemblyAliases: {} as Record<string, string>,
  assemblyManager: {
    has: (name: string) => canonicalAssembly(name) !== undefined,
    get: (name: string) => {
      const canonical = canonicalAssembly(name)
      return canonical === undefined
        ? undefined
        : { name: canonical, aliases: aliasesOf(canonical) }
    },
    get assemblyList(): { name: string; aliases: string[] }[] {
      return mockSession.assemblyNames.map(name => ({
        name,
        aliases: aliasesOf(name),
      }))
    },
  },
  views: [] as unknown[],
  addedViews: [] as [string, Record<string, unknown> | undefined][],
  addView(type: string, snapshot?: Record<string, unknown>) {
    mockSession.addedViews.push([type, snapshot])
    return { id: `view-${mockSession.addedViews.length}` }
  },
  notify: vi.fn(),
}

// Don't use vi.importActual due to circular dependencies
// Instead, manually mock just what we need
export function coreUtilMock() {
  // Return minimal mock that doesn't trigger circular load
  return {
    getSession: () => mockSession,
    getContainingView: () => {
      throw new Error('no containing view found')
    },
    getContainingTrack: () => {
      throw new Error('not in a track')
    },
    getRpcSessionId: () => 'test',
    isSessionModelWithWidgets: () => false,
    statusMessageText: (status: unknown) => status,
    // Add stubs for other potentially imported items
    parseLocString: () => ({}),
    getEnv: () => ({}),
    useWidthSetter: () => {},
    measureText: () => 0,
    IntervalTree: class {},
    // Add other exports that might be needed
    getSnapshot: () => ({}),
    applySnapshot: () => {},
    objectHash: () => '',
  }
}

// Partial, not wholesale: core modules pulled in transitively (BaseFeatureWidget's
// config schema) call ConfigurationSchema at module-eval time.
export function configurationMock<Original>(original: Original) {
  return {
    ...original,
    readConfObject: vi
      .fn<typeof readConfObject>()
      .mockImplementation((obj: Record<string, unknown>, key?: unknown) =>
        key === 'assemblyNames' ? (obj.assemblyNames ?? []) : obj[String(key)],
      ),
  }
}

export const mockReadFile = vi.fn()
// A read with no encoding gets bytes, as generic-filehandle2 returns them
export function ioMock() {
  return {
    openLocation: () => ({
      readFile: async (opts?: string | { encoding?: string }) => {
        const read: unknown = await mockReadFile(opts)
        return typeof read === 'string' &&
          typeof opts !== 'string' &&
          !opts?.encoding
          ? new TextEncoder().encode(read)
          : read
      },
    }),
  }
}
