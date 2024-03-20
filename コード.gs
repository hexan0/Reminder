//doPost関数など、アプリの中心的なファイル

//doGet関数
function doGet() {
  return ContentService.createTextOutput("success");
}

//moment.jsの読み込み
var moment = Moment.load();
var mode = 0;//0待機状態、1リマインダー名待ち、2登録時間待ち

function doPost(e) {
 var sheet = spreadsheet.getSheetByName("webhook");
 var webhookData = JSON.parse(e.postData.contents).events[0];
 var message, replyToken, replyText, replyId, userId, groupId, roomId;
 message = webhookData.message.text;
 replyToken = webhookData.replyToken;
 userId = webhookData.source.userId;
 groupId = webhookData.source.groupId;
 roomId = webhookData.source.roomId;
 //var userDataRow = searchUserDataRow(todo);
 //var todo = getTodoCell(userDataRow).getValue();
 //var todoDate = getDateCell(userDataRow).getValue();
 
 //個チャかグループか判定
 if(!groupId){
   replyId = userId;
 }else{
   replyId = groupId;
 }
 //コマンド判定
 if(message.substr(0,1)=='#'){
   message = message.substr(1);
 }
 var command = message.split(' ');
 switch (command[0]) {
   case '使い方':
   case 'howtouse':
      replyText = 'はい！あとで思い出したいことをラインしてくれれば、いつお知らせしてほしいか聞くので、「10分後」「11月23日17時00分」など、教えてください♫その日時にお知らせします。';
      break;
   case 'キャンセル':
   case 'cancel':
      replyText = cancel(userDataRow);
      break;  
   case '確認':
   case 'check':
     //登録済みのリマインダーを表示
     replyText = check(replyId);
     
     break;
   case 'add':
   case '追加':
     if(getTimeData(replyId,command[1])){
       replyText = '紛らわしいから同じ名前のリマインダーは登録できないよ！';
     }else{
       replyText = setData(replyId, command[1], command[2]);
       //replyText = setTodo(userDataRow, command[1]);
       //replyText = setDate(userDataRow, command[2]);
     }
     break;
   default:
     replyText = "そのコマンドは存在しないよ！\n会話の途中でわりこんじゃったならごめんね！";
     /*if (todo) {
       replyText = setDate(userDataRow, command[1]);
     }
     else {
       replyText = setTodo(userDataRow, command[2]);
     }*/
 }
 return sendLineMessageFromReplyToken(replyToken, replyText);
 //return sendLineMessageFromReplyToken(replyToken, userId + "\n" + groupId + "\n" + roomId);
}




//
function searchUserDataRow(userId) {
 //userDataRow = searchRowNum(userId, 0);
 if (sheet == null) {
   //appendToSheet(userId);
   SpreadsheetObject.insertSheet(userId);
 }
 return sheet;
}

//リマインダー予定確認
function check(id){
  var sheet = spreadsheet.getSheetByName("webhook");
  var dat = sheet.getDataRange().getValues();
  var text = "<現在予約されているリマインダー>";
  for (var i = 0; i < dat.length; i++) {
   if (dat[i][1] == id) {
     text=text +"\n"+ dat[i][2] + dat[i][3];
   }
 }
 return text;
}

//内容設定
function setTodo(row, message) {
 setFromRowCol(message, row, 1);
 return '「' + message + ' 」だね！覚えたよ！\nいつ教えてほしい？例：「10分後」「11月23日17時00分」など。「キャンセル」って言ってくれればやめるよ〜';
}

//日時設定
function setDate(row, message) {
 // 全角英数を半角に変換
 message = message.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
   return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
 });
 var date = Moment.moment(message, 'M月D日H時m分', true).format('YYYY年MM月DD日H時m分');
 if (date === 'Invalid date') {
   var match = message.match(/\d+/g);
   if (match !== null) {
     date = Moment.moment().add(+match[0], 'minutes').format('YYYY年MM月DD日H時m分');
   }
 }
 if (date === 'Invalid date') {
   return 'いつなのかわかんないよ！分かりやすく教えて！'
 } else if (date < Moment.moment()) {
   return 'タイムマシンが完成するまで待って！未来の日時で教えてね'
 }
 setTrigger(row, date);
 setFromRowCol(date, row, 2);
 return date + 'にお知らせするね！';
}

//キャンセルするとき、
function cancel(row) {
 getTodoCell(row).clear();
 getDateCell(row).clear();
 triggerCell = getTriggerCell(row)
 var triggerId = triggerCell.getValue();
 if (triggerId) {
   deleteTrigger(triggerId);
 }
 triggerCell.clear();
 return 'またなんかあったら言ってね〜'
}

//通知
function remind(e) {
 var noticeDataRow = searchRowNum(e.triggerUid, 3);
 var noticeId = getUserIdCell(noticeDataRow).getValue();
 var todo = getTodoCell(noticeDataRow).getValue();
 var remindText = '「' + todo + '」の時間だよ！ 忘れずにね！';
 cancel(noticeDataRow);
 return sendLineMessageFromUserId(noticeId, remindText);
}
