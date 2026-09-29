export function autoCapitalize(original) {
    const text = String(original ?? '').replace(/\s+/g, ' ').trim()
    if (text === '') return ''
    return text.replace(/(^|\s)(\S)/g, (_, prev, letter) => prev + letter.toUpperCase())
}
