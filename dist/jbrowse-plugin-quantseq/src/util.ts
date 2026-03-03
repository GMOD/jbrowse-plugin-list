/**
 * gets the origin for drawing the graph. for linear this is 0, for log this is arbitrarily set to log(1)==0
 */
export function getOrigin(scaleType: string) {
  if (scaleType === 'log') {
    return 1
  }
  return 0
}

/* 
Gets the correct color for a given base
*/
export function getColor(base: string) {
  base = base.toUpperCase()
  if (base === 'T') {
    return '#f44336'
  } else if (base === 'A') {
    return '#4caf50'
  } else if (base === 'G') {
    return '#ffc107'
  } else if (base === 'C') {
    return '#2196f3'
  } else {
    return '#000'
  }
}
