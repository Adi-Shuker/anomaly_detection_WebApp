function searchText(key, text) {
    let result = ''
    text.split("\n").forEach(row => {
        if (row.search(key) !== -1)
            result += row + '\n'
    })
    return result
}
//export file to module
module.exports.searchText = searchText