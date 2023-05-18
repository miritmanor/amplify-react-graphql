
export function isInSearchTerm(item,searchTerm) {
    for (var key in item) {
        if (typeof item[key] === 'string') {
          if (item[key].toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
}
