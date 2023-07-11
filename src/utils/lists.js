
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
export const changesList = (list,changesFieldName) => {
  console.log("changesList: list:",list," changesFieldName:",changesFieldName )
  var newList=[];
  for (var i in list) {
    const dict = list[i];
    console.log("dict:",dict);
    var newDict = JSON.parse(JSON.stringify(dict)); // make a copy of the dictionary
    const changes = dict[changesFieldName];
    console.log("changes:",changes )
    const cleanString = changes.replace(/"/g,'\\"').replace(/'/g,'"').replaceAll("\\xa0"," ");
    const jsonDetails = JSON.parse(cleanString);
    for (var detail in jsonDetails) {
      console.log("detail:",detail);
      newDict={...newDict,'Field name': detail};
      newDict={...newDict,'Value in main DB': jsonDetails[detail]['main DB']};
      newDict={...newDict,'Value in store': jsonDetails[detail]['store']};
      //console.log("newDict:",newDict);
      newList.push(newDict);
    }
  }
  return newList;

  }

// {'description': {'main DB': '<p>קוטר 12 ס"מ</p>\n<p>הכלי המופיע בתמונה הינו בתוספת תשלום</p>\n', 'store': '<p>קוטר 12 ס"מ<br />\nn<br />\nnהכלי המופיע בתמונה הינו בתוספת תשלום</p>\n'}}
// {'status': {'main DB': 'draft', 'store': 'publish'}, 'sale_price': {'main DB': '23', 'store': '22'}, 'regular_price': {'main DB': '26', 'store': '24'}}


