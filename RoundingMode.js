/**
 * java.math.RoundingMode emulation — frozen for financial consistency.
 */
const RoundingMode = Object.freeze({
    UP:        'UP',
    DOWN:      'DOWN',
    CEILING:   'CEILING',
    FLOOR:     'FLOOR',
    HALF_UP:   'HALF_UP',
    HALF_DOWN: 'HALF_DOWN',
    HALF_EVEN: 'HALF_EVEN',
});

export { RoundingMode };
