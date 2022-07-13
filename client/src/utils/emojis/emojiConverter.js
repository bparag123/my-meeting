export const toUTF16 = (codePoint) => {
    const TEN_BITS = parseInt('1111111111', 2);
    function u(codeUnit) {
        return '\\u' + codeUnit.toString(16).toUpperCase();
    }

    if (codePoint <= 0xFFFF) {
        return u(codePoint);
    }
    codePoint -= 0x10000;

    // Shift right to get to most significant 10 bits
    var leadSurrogate = 0xD800 + (codePoint >> 10);

    // Mask to get least significant 10 bits
    var tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);

    return u(leadSurrogate) + '-' + u(tailSurrogate);
}

export const surrogatePairToCodePoint = (charCode1, charCode2) => {
    return ((charCode1 & 0x3FF) << 10) + (charCode2 & 0x3FF) + 0x10000;
}

export const unicodeToCodepoint = function (text) {
    return text.replace(/\\u([\dA-F]{4})-\\u([\dA-F]{4})/gi, function (match) {
        const x = match.split("-")
        const high = "0x" + x[0].slice(-4)
        const low = "0x" + x[1].slice(-4)
        const codePoint = surrogatePairToCodePoint(high, low)
        return String.fromCodePoint(codePoint)
    });
}