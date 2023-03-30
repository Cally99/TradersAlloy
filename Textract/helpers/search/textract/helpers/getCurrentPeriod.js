module.exports.getCurrentPeriod = (table) => {
    let i, j
    let period
    for (i = 0; i < table.length; i++) {
        for (j = 0; j < table[i].length; j++) {
            if (/2[0-9]{3}/.test(table[i][j])) { period = j; break }
        }
    }

    return table.map(row => [row[0], row.splice(period || 1, 1)[0]])
}