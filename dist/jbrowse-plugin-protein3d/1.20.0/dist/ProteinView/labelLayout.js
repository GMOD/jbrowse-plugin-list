// up-right first, then the other diagonals, each at a longer leader in turn
const DIRECTIONS = [
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
];
const LEADS = [28, 52, 80];
// a residue's dot, which no box may cover
const DOT_RADIUS = 5;
function overlaps(a, b) {
    return (a.x < b.x + b.width &&
        b.x < a.x + a.width &&
        a.y < b.y + b.height &&
        b.y < a.y + a.height);
}
/**
 * Places each label on a diagonal leader from its residue, taking the first
 * candidate whose box stays inside `bounds` and covers no earlier box and no
 * residue's dot, so the labels of neighbouring residues (KRAS G12 and G13)
 * lean apart. A label with no free candidate takes the first.
 */
export function placeLabels(requests, bounds) {
    const dots = requests.map(r => ({
        x: r.x - DOT_RADIUS,
        y: r.y - DOT_RADIUS,
        width: DOT_RADIUS * 2,
        height: DOT_RADIUS * 2,
    }));
    const boxes = [];
    return requests.map(({ x, y, width, height }) => {
        const candidates = LEADS.flatMap(lead => DIRECTIONS.map(([dx, dy]) => {
            const leaderX = x + dx * lead;
            const leaderY = y + dy * lead;
            return {
                leaderX,
                leaderY,
                box: {
                    x: dx > 0 ? leaderX : leaderX - width,
                    y: dy > 0 ? leaderY : leaderY - height,
                    width,
                    height,
                },
            };
        }));
        const free = candidates.find(({ box }) => box.x >= 0 &&
            box.y >= 0 &&
            box.x + width <= bounds.width &&
            box.y + height <= bounds.height &&
            !boxes.some(b => overlaps(b, box)) &&
            !dots.some(d => overlaps(d, box)));
        const { leaderX, leaderY, box } = free ?? candidates[0];
        boxes.push(box);
        return { boxX: box.x, boxY: box.y, leaderX, leaderY };
    });
}
