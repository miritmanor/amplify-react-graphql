export const MultipleLists = (list) => {
  var resultList = [];
  for (var i in list) {
    resultList = resultList.concat(list[i]);
  }
  return resultList;
};

// receive a list of dictionaries, each line representing a product, with a changes field that should be analyzed
// the name of the field with the changes is a parameter
// return a list with the changes analyzed
export const chanagesList = (list,changesFieldName) => {

}

const changeOneDict = (dict,changesFieldName) => {
  //var newDict = dict;
  var changes = JSON.parse(dict[changesFieldName]);
  for (var change in changes) {
    // each changes looks like: {'field-name': {'main DB': valule, 'store': value}}
    const fieldName=change;
    const valueInStore=changes[change]['store'];
    const valueInMainDB=changes[change]['main DB'];
    //newDict[change] = changes[change];
  }


}
