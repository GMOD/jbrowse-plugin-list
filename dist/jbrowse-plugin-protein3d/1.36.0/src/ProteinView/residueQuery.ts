import { residueNumber, residueRuns } from 'p2s_mapper'

import type { Entity } from 'p2s_mapper'

interface ResidueEnd {
  letter?: string
  number: number
}

export interface ResidueQuery {
  chain?: string
  start: ResidueEnd
  end: ResidueEnd
}

const QUERY =
  /^(?:([^:\s]+):\s*)?([A-Za-z])?(-?\d+)(?:\s*-\s*([A-Za-z])?(-?\d+))?$/
const CHAIN_PREFIX = /^[^:\s]+:\s*/
const INSERTION_CODE = /\d[A-Za-z](?=$|\s|-)/

/**
 * A residue or a range typed the way a paper names one, in the structure's
 * author numbering: `248`, `R248`, `A:248`, `245-250` or `A: R245-T250`.
 */
export function parseResidueQuery(text: string): ResidueQuery | undefined {
  const match = QUERY.exec(text.trim())
  const [, chain, startLetter, startNumber, endLetter, endNumber] = match ?? []
  const start = startNumber
    ? { letter: startLetter?.toUpperCase(), number: Number(startNumber) }
    : undefined
  return start
    ? {
        chain,
        start,
        end: endNumber
          ? { letter: endLetter?.toUpperCase(), number: Number(endNumber) }
          : start,
      }
    : undefined
}

function residueName({ letter, number }: ResidueEnd) {
  return `${letter ?? ''}${number}`
}

function letterProblem(entity: Entity, { letter, number }: ResidueEnd) {
  const position = entity.seq
    .split('')
    .findIndex((_, pos) => residueNumber(entity, pos) === number)
  const actual = position === -1 ? undefined : entity.seq[position]
  return letter && actual && actual !== letter
    ? `Residue ${number} is ${actual}${number}, not ${letter}${number}`
    : undefined
}

function queryProblem(query: ResidueQuery, entity: Entity | undefined) {
  const named =
    query.start === query.end
      ? residueName(query.start)
      : `${residueName(query.start)}-${residueName(query.end)}`
  return !entity
    ? 'The structure has not loaded'
    : query.end.number < query.start.number
      ? `${named} ends before it starts`
      : query.chain && !entity.chains.includes(query.chain)
        ? `Chain ${query.chain} is not a chain of the mapped entity (${entity.chains.join(', ')})`
        : residueRuns(entity, {
              start: query.start.number,
              end: query.end.number,
            }).length === 0
          ? `No residue numbered ${named} in this structure`
          : (letterProblem(entity, query.start) ??
            letterProblem(entity, query.end))
}

/**
 * A typed residue read once: the query when it names residues the mapped
 * entity holds, else what is wrong with it. A chain prefix only has to name a
 * chain of the entity; the residues are lit on every copy of it.
 */
export function checkResidueQuery(text: string, entity: Entity | undefined) {
  const query = parseResidueQuery(text)
  const problem = query ? queryProblem(query, entity) : undefined
  return query
    ? problem === undefined
      ? { query }
      : { problem }
    : {
        problem: INSERTION_CODE.test(text.trim().replace(CHAIN_PREFIX, ''))
          ? 'Insertion codes such as 82A are not supported; type the number alone'
          : 'Type a residue number such as 248, R248, A:248 or 245-250',
      }
}
