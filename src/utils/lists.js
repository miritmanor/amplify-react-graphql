export const MultipleLists = (list) => {
  var resultList = [];
  for (var i in list) {
    resultList = resultList.concat(list[i]);
  }
  return resultList;
};
