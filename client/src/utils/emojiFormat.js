const emojiParser = (str) => {
    console.log(str)
    const newStr = str.replace(/<emo>(\d+)<\/emo>/gm, (matched) => {
        const codePoint = matched.replace(/<\/?emo>/g, '')
        return String.fromCodePoint(codePoint)
    })
    return newStr
}

export default emojiParser