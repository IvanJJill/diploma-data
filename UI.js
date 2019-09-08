function startUI(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSh = ss.getActiveSheet();
  
  var dataColsNum = dataSh.getDataRange().getNumColumns();
  var fromSel = dataSh.getRange(1, 1, 1, dataColsNum).getValues()
      .filter(function(val){return val.length > 0;});
  
  var startForm = HtmlService.createTemplateFromFile('startFormUI');
  
  startForm.axisSelection = fromSel[0];
  
  
  var translatorSh = ss.getSheetByName('translate');
  var translatorColsNum = translatorSh.getDataRange().getNumColumns();
  
  startForm.dictSelection = translatorSh.getRange(1, 1, 1, translatorColsNum).getValues()
     .filter(function(val){return val.length > 0;})[0];
  
 
  var html = startForm.evaluate()
  .setWidth(640)
  .setHeight(480);
  
  SpreadsheetApp.getUi()
  .showModalDialog(html, 'Settings');
}
