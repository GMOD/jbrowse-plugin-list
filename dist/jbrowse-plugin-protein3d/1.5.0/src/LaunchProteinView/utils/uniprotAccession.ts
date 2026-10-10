// https://www.uniprot.org/help/accession_numbers, with the `-2` suffix that
// names an isoform
const UNIPROT_ACCESSION =
  /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})(?:-\d+)?$/

export function isUniProtAccession(text: string) {
  return UNIPROT_ACCESSION.test(text)
}

export const UNIPROT_ACCESSION_HINT =
  'A UniProt accession is six or ten characters, like P04637 or A0A024R1R8'
