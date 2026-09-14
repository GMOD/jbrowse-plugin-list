export default function getSearchDescription({
  selectedQueryId,
  recognizedIds,
  geneName,
  joinWord = 'and',
}: {
  selectedQueryId: string
  recognizedIds: string[]
  geneName?: string
  joinWord?: 'and' | 'or'
}) {
  if (selectedQueryId === 'auto') {
    return [
      recognizedIds.length > 0
        ? `database ID${recognizedIds.length > 1 ? 's' : ''} "${recognizedIds.join('", "')}"`
        : undefined,
      geneName ? `gene name "${geneName}"` : undefined,
    ]
      .filter(Boolean)
      .join(` ${joinWord} `)
  }
  if (selectedQueryId.startsWith('gene:')) {
    return `gene name "${selectedQueryId.replace('gene:', '')}"`
  }
  return `database ID "${selectedQueryId}"`
}
