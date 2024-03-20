//スプレッドシートとやりとりするための関数を集めたファイル

//スプレッドシートのID
var spreadsheet = SpreadsheetApp.openById(SS);
var sheet = spreadsheet.getSheetByName('webhook');

//スプレッドシートに新たな行を書き込み
function appendToSheet(text) {
 sheet.appendRow([text]);
}


function setData(id, todo, time){
  // 全角英数を半角に変換
 time = time.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
   return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
 });
 
 var date = Moment.moment(time, 'M月D日H時m分', true).format('YYYY年MM月DD日H時m分');
 if (date === 'Invalid date') {
   var match = time.match(/\d+/g);
   if (match !== null) {
     date = Moment.moment().add(+match[0], 'minutes').format('YYYY年MM月DD日H時m分');
   }
 }
 
 if (date === 'Invalid date') {
   return 'いつなのかわかんないよ！分かりやすく教えて！'
 } else if (date < Moment.moment()) {
   return 'タイムマシンが完成するまで待って！未来の日時で教えてね'
 }
 
  var write_r = sheet.getLastRow() ;
  sheet.getRange("A" + write_r+1).setValue(id);
  sheet.getRange("B" + write_r+1).setValue(todo);
  setTrigger(write_r, date);
  setFromRowCol(date, write_r, 2);
  return todo+"を"+time+"にお知らせするね！";
}

function getTimeData(id, todo){
  //受け取ったシートのデータを二次元配列に取得
 var dat = sheet.getDataRange().getValues();
 for (var i = 0; i < dat.length; i++) {
   if (dat[i][1] === id) {
     if(dat[i][2] === todo){
       return dat[i][3];
     }
   }
 }
 return false;
}
/*
function searchSameTodo(id, todo){
  var dat = sheet.getDataRange().getValues();
 for (var i = 0; i < dat.length; i++) {
   if (dat[i][1] === id) {
     if(dat[i][2] === todo){
       return dat[i][3];
     }
   }
 }
 return false;
}*/

//検索する値とcolを指定して、見つけた行の番号を返す、なければfalseを返す
function searchRowNum(searchVal, col) {
 //受け取ったシートのデータを二次元配列に取得
 var dat = sheet.getDataRange().getValues();
 for (var i = 0; i < dat.length; i++) {
   if (dat[i][col] === searchVal) {
     return i;
   }
 }
 return false;
}

/*
function searchSheet(searchVal) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(searchVal);
  return sheet.getName();
}
*/

//row(行)とcol(列)を指定して、値を読み込み・書き込みする
function getFromRowCol(sheetName, row, col) {
 var dat = sheet.getDataRange().getValues();
 return dat[row][col];
}
function setFromRowCol(val, row, col) {
 sheet.getRange(row + 1, col + 1).setValue(val);
}

//rowを指定して、その行の〇〇のセルを取り出す
function getUserIdCell(row) {
 return sheet.getRange(row + 1, 1);
}
function getTodoCell(row) {
 return sheet.getRange(row + 1, 2);
}
function getDateCell(row) {
 return sheet.getRange(row + 1, 3);
}
function getTriggerCell(row) {
 return sheet.getRange(row + 1, 4);
}

