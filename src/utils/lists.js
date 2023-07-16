
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
    
    // Replace double quotes inside single quotes
    //const escapedJsonString = changes.replaceAll("גר'","*גר").replace(/'([^']*)'/g, (_, g1) => "'" + g1.replace(/"/g, '\\"') + "'"); 
    const escapedJsonString = changes.replaceAll("גר'","*גר").replace(/'((?:\\'|[^'])*)'/g, (_, g1) => "'" + g1.replace(/"/g, '\\"') + "'"); 
    //var cleanString = changes.replace(/"/g,'\\"').replaceAll("גר'","גר").replace(/'/g,'"').replaceAll("\\xa0"," ");
    console.log("escapedJsonString:",escapedJsonString );
    var cleanString = escapedJsonString.replace(/'/g,'"').replaceAll("\\xa0"," ").replaceAll("*גר","גר'");
    //var newString=cleanString.replaceAll("*גר","גר'");
    console.log("cleanString:",cleanString );
    try {
      const jsonDetails = JSON.parse(cleanString);
      for (var detail in jsonDetails) {
        console.log("detail:",detail);
        newDict={...newDict,'Field name': detail}; 
        newDict={...newDict,'Value in main DB': jsonDetails[detail]['main DB']};
        newDict={...newDict,'Value in store': jsonDetails[detail]['store']};
        //console.log("newDict:",newDict);
        newList.push(newDict);
        newDict['Details']='';
      }
    } catch (e) {
      console.log("error in JSON.parse:",e);
    }
  }
  return newList;

  }



//{'name': {'main DB': 'בזיליקום - 2 מארזים גדולים', 'store': 'בזיליקום – 2 מארזים'},
// 'unit': {'main DB': "שני מארזים של 130 גר'", 'store': "שני מארזים של 60-70 גר'"}
//, 'status': {'main DB': 'draft', 'store': 'publish'}, 'sale_price': {'main DB': '24', 'store': '15'}, 'regular_price': {'main DB': '28', 'store': '18'}}

// {'description': {'main DB': '<p>קוטר 12 ס"מ</p>\n<p>הכלי המופיע בתמונה הינו בתוספת תשלום</p>\n', 'store': '<p>קוטר 12 ס"מ<br />\nn<br />\nnהכלי המופיע בתמונה הינו בתוספת תשלום</p>\n'}}
// {'status': {'main DB': 'draft', 'store': 'publish'}, 'sale_price': {'main DB': '23', 'store': '22'}, 'regular_price': {'main DB': '26', 'store': '24'}}


