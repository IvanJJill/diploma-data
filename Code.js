function buidChartData(horSel, vertSel, horTrFrom, horTrTo, vertTrFrom, vertTrTo) {

  if(horSel.length <=0 || vertSel.length <= 0){
    throw new Error( "axis were not selected" );
  }
  
  var newPageName = getPageName();
  if(newPageName == null){
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSh = ss.getActiveSheet();
  
  var dataHor = getColumnByName(dataSh, horSel);
  var dataVert = getColumnByName(dataSh, vertSel);
   
  // Translate the data for both rows
  if(vertTrFrom != null && vertTrTo != null){
    Logger.log('Translating vertical');
    var translated = translator(dataVert, vertTrFrom, vertTrTo);

    dataVert = translated == null ? dataVert : translated; // if no vocabulart - then skip it
  }
  
  if(horTrFrom != null && horTrTo != null){
    Logger.log('Translating vertical');
    var translated = translator(dataHor, horTrFrom, horTrTo);

    dataHor = translated == null ? dataHor : translated; // if no vocabulart - then skip it
  }
  
  var uniqHor = getSortedUniqValues(dataHor); // data with years and occurances
  var sortedUniqHor = Object.keys(uniqHor).sort(); // array with sorted years
 
  var uniqVert = getSortedUniqValues(dataVert); // data with publishers and occurances
  var sortedUniqVert = Object.keys(uniqVert).sort(); // array with sorted publishers
  
  Logger.log('filling horizontal/vertical axes with data');
  
  var resultSh = !ss.getSheetByName(newPageName) ? ss.insertSheet(newPageName) : ss.getSheetByName(newPageName);
  resultSh.clear();
  
  var header = resultSh.getRange('A1').setValue(horSel + '/' + vertSel); // set header for data representation
  
  // set horizontal axis values
  resultSh.getRange(1, 2, 1, sortedUniqHor.length).setValues([sortedUniqHor]);
  // set verticall axis values
  resultSh.getRange(2,1,sortedUniqVert.length,1).setValues(sortedUniqVert.map(function(val) {return[val]}));
  
  Logger.log('looping through data to fill up the table');
  var resultRange = resultSh.getRange(2, 2, sortedUniqVert.length, sortedUniqHor.length);
  var results = resultRange.getValues();
  
  for(var row = 0; row < sortedUniqVert.length ; row++){
    var val = sortedUniqVert[row];
    for(var i = 0; i < dataVert.length; i++){
      if(dataVert[i][0].toString() == val){
        var col = getIndex(sortedUniqHor, dataHor[i][0]); // get index of that years in array
        results[row][col]++; // set the value, increase if occures
      } 
    }
  }
  
// copy array to resulting range
  resultRange.setValues(results);

  Logger.log('Finnished!');
  
}

/*
Function to return occurances of values in a form of key:value pairs
*/
function getSortedUniqValues (data) {
  var uniq = {};
  
  for(var i=0; i<data.length; i++){
    if(data[i][0] == '') {
      continue;
    }
    var val = uniq[data[i][0]];
    uniq[data[i][0]] = val == undefined ? 1 : ++val; 
  }
  
  return uniq;
}

function getIndex(keys, lookupValue){
  for(var i = 0; i < keys.length; i++){
    if(keys[i] == lookupValue){
      return i;
    }
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// UI menu to prompt to enter a sheet name
function getPageName(){
  // Display a dialog box with a title, message, input field, and "OK" and "Cancel" buttons. The
  // user can also close the dialog by clicking the close button in its title bar.
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Nazev nove stranky', 'Nazev', ui.ButtonSet.OK_CANCEL);
  
  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    return response.getResponseText();
  } else {
    return null;
  }
}

/* Function looks up for a dictionaty sheet
   which should contain 2 columns with values that it will substitute
   left column should have original values
   right column should have new values
   If translation wasn't found it will return "!!!NOT FOUND!!!" string as translation
   
   @param dataToTranslate should represent a SINGLE coulmn with data - e.g. a 2D array [[val1],[val2],...[valn]]
   @return data in the same format that it took.
*/
function translator(dataToTranslate, fromColName, toColName){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var translatorSh = ss.getSheetByName('translate');
  
  // if no vocabulary sheet exists - return
  if (!translatorSh){
    Logger.log('No translate sheet');
    return null;
  }
  
  Logger.log('Translate sheet found');
  
  var fromData = getColumnByName(translatorSh, fromColName);
  var toData = getColumnByName(translatorSh, toColName);

  // Check if vocabulary is large enough to keep translating
  if( fromData.length != toData.length || fromData.length < 1 || toData.length <1){
    return null;
  }
   
  var vocabulary = {};
  for(var i = 0; i < fromData.length; i++){
    if(fromData[i][0].length > 0 && fromData[i][0] != null && toData[i][0] != null){
      vocabulary[fromData[i][0]] = toData[i][0];
    }
  }
  
  return dataToTranslate.map(function(row) {
    return row.map(
      function (cell) {
        return vocabulary[cell] != null ? vocabulary[cell] : "!!!NOT FOUND!!!";
      }
    );
  });
  
}

// Returns data from a column by it's name specified in header
// excluding the header row
function getColumnByName(sh, colName){
  var colsNum = sh.getDataRange().getNumColumns();
  var selectedNum = getIndex(sh.getRange(1, 1, 1, colsNum).getValues()[0], colName);
  var rowsNum = sh.getDataRange().getNumRows() - 1;
  selectedNum++; //adjust by 1 due to range starting from 1
  return sh.getRange(2, selectedNum, rowsNum).getValues();
}
