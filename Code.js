const doc = SpreadsheetApp.getActive();
const topik_i_vocab = doc.getSheetByName("topik_i_vocabulary");
const topik_ii_vocab = doc.getSheetByName("topik_ii_vocabulary");
const common_vocab = doc.getSheetByName('common_vocabulary');
const conversation_title = doc.getSheetByName('conversation_titles');
const conversations = doc.getSheetByName('conversations');
const user = doc.getSheetByName("user");

function doGet(e) {
  let response;
  const action = e.parameter.action;
  const whatsapp = e.parameter.whatsapp;
  const user_data = getDataByWhatsapp(whatsapp, user);

  if (action == 'start-registration') {
    const id = generateNewId(user);
    const name = e.parameter.name;
    let isSuccess, data, message;

    if (user_data == null) {
      user.appendRow([id, whatsapp, name, 0, 0, 0, 0]);
      data = getDataById(id, user);
      message = 'Success!';
      isSuccess = true;
    } else {
      data = null;
      message = 'Failed. Your WhatsApp number is already signed up.'
      isSuccess = false;
    }

    response = {
      success: isSuccess,
      data: data,
      message: message
    }
  } else if (action == 'get-vocab') {
    let vocab_set = [];
    let isSuccess = true;

    if (!topik_i_vocab_finished(user_data)) {

      const n = 5;
      vocab_set = vocab_set.concat(getAllData(topik_i_vocab).slice(user_data.topik_i_vocab_count, user_data.topik_i_vocab_count + n));

      user_data.topik_i_vocab_count = user_data.topik_i_vocab_count + n;
      updateDataById(user_data, user);

    } else if (!topik_ii_vocab_finished(user_data)) {

      const n = 5;
      vocab_set = vocab_set.concat(getAllData(topik_ii_vocab).slice(user_data.topik_ii_vocab_count, user_data.topik_ii_vocab_count + n));

      user_data.topik_ii_vocab_count = user_data.topik_ii_vocab_count + n;
      updateDataById(user_data, user);

    } else if (!common_vocab_finished(user_data)) {

      const n = 5;
      vocab_set = vocab_set.concat(getAllData(common_vocab).slice(user_data.common_vocab_count, user_data.common_vocab_count + n));

      user_data.common_vocab_count = user_data.common_vocab_count + n;
      updateDataById(user_data, user);

    } else {
      vocab_set = get_vocab_review(user_data);
    }

    response = {
      success: isSuccess,
      data: vocab_set,
      message: "Success to get vocabularies."
    }

  } else if (action == 'get-vocab-review') {

    let vocab_set = get_vocab_review(user_data);
    let isSuccess = true;

    response = {
      success: isSuccess,
      data: vocab_set,
      message: "Success to get vocabularies review."
    }
  } else if (action == 'get-grammar') {

    let grammar_set;
    let isSuccess = true;

    if (!grammar_finised(user_data)) {

      grammar_set = {
        grammar: getDataById(user_data.conv_title_count + 1, conversation_title),
        example: getConversations(user_data.conv_title_count + 1, conversations)
      };

      user_data.conv_title_count = user_data.conv_title_count + 1;
      updateDataById(user_data, user);

    } else {

      grammar_set = get_grammar_review(user_data);

    }

    response = {
      success: isSuccess,
      data: grammar_set,
      message: "Success to get grammar."
    }

  } else if (action == 'get-grammar-review') {

    let grammar_set = get_grammar_review(user_data);
    let isSuccess = true;

    response = {
      success: isSuccess,
      data: grammar_set,
      message: "Success to get grammar review."
    }
  } else if (action == 'stop-subscription') {

    let isSuccess, message;

    if (user_data != null) {
      deleteUserByWhastsapp(whatsapp);
      message = 'Success to delete user.'
      isSuccess = true;
    } else {
      message = 'Failed. Your number hasn\'t been signed up yet!';
      isSuccess = false;
    }

    response = {
      success: isSuccess,
      message: message
    }
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function deleteUserByWhastsapp(whatsapp) {
  var rows = user.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  var rowsDeleted = 0;
  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    if (row[1] == whatsapp || row[1] == '') {
      // This searches all cells in columns A (change to row[1] for columns B and so on) and deletes row if cell is empty or has value 'delete'.
      user.deleteRow((parseInt(i) + 1) - rowsDeleted);
      rowsDeleted++;
    }
  }
};

function get_grammar_review(user_data) {
  let grammar, example;

  if (grammar_finised(user_data)) {
    grammar = getRandomItem(getAllData(conversation_title));
    example = getConversations(grammar.id, conversations);
  } else {
    let grammars = getAllData(conversation_title).slice(0, user_data.conv_title_count);

    grammar = getRandomItem(grammars);
    example = getConversations(grammar.id, conversations);
  }

  return {
    "grammar": grammar,
    "example": example
  };
}

function get_vocab_review(user_data) {

  let vocab_set = [];

  if (topik_i_vocab_finished(user_data) && topik_ii_vocab_finished(user_data) && common_vocab_finished(user_data)) {

    const n = 10;
    vocab_set = vocab_set
      .concat(getAllData(topik_i_vocab))
      .concat(getAllData(topik_ii_vocab))
      .concat(getAllData(common_vocab));
    vocab_set = getMultipleRandomItem(vocab_set, n);

  } else if (topik_i_vocab_finished(user_data) && topik_ii_vocab_finished(user_data)) {

    const n = 10;
    vocab_set = vocab_set
      .concat(getAllData(topik_i_vocab))
      .concat(getAllData(topik_ii_vocab))
      .concat(getAllData(common_vocab).slice(0, user_data.common_vocab_count));
    vocab_set = getMultipleRandomItem(vocab_set, n);

  } else if (topik_i_vocab_finished(user_data)) {

    const n = 10;
    vocab_set = vocab_set
      .concat(getAllData(topik_i_vocab))
      .concat(getAllData(topik_ii_vocab).slice(0, user_data.topik_ii_vocab_count));
    vocab_set = getMultipleRandomItem(vocab_set, n);

  } else {

    const n = 10;
    vocab_set = vocab_set
      .concat(getAllData(topik_i_vocab).slice(0, user_data.topik_i_vocab_count));
    vocab_set = getMultipleRandomItem(vocab_set, n);

  }

  return vocab_set;
}

function getMultipleRandomItem(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function topik_i_vocab_finished(user_data) {
  return ((topik_i_vocab.getLastRow() - 1) == user_data.topik_i_vocab_count);
}

function topik_ii_vocab_finished(user_data) {
  return ((topik_ii_vocab.getLastRow() - 1) == user_data.topik_ii_vocab_count);
}

function common_vocab_finished(user_data) {
  return ((common_vocab.getLastRow() - 1) == user_data.common_vocab_count);
}

function grammar_finised(user_data) {
  return ((conversation_title.getLastRow() - 1) == user_data.conv_title_count);
}

function updateDataById(new_data, sheet) {
  // index starts from 0
  const index = getColumnValues('id', sheet).findIndex(row => row == new_data.id);

  if (index >= 0) {
    const updateRow = Object.values(new_data);
    sheet.getRange(index + 2, 1, 1, updateRow.length).setValues([updateRow]);
  }
}

function getColumnValues(columnName, sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const columnIndex = headers.indexOf(columnName) + 1;
  const values = sheet.getRange(2, columnIndex, sheet.getLastRow() - 1).getValues().map(row => row[0]);
  return values;
}


function getAllData(sheet) {
  const data = [];
  const rlen = sheet.getLastRow();
  const clen = sheet.getLastColumn();

  const rows = sheet.getRange(1, 1, rlen, clen).getValues();

  for (let i = 0; i < rows.length; i++) {
    const dataRow = rows[i];
    let record = {};
    for (let j = 0; j < clen; j++) {
      record[rows[0][j]] = dataRow[j];
    }
    if (i > 0) {
      data.push(record);
    }
  }

  return data;
}

function generateNewId(sheet) {
  if (getAllData(sheet).length == 0) {
    return 1;
  }

  return getAllData(sheet).reduce((max, row) => max.id > row.id ? max : row).id + 1;
}

function getDataById(id, sheet) {
  let data = getAllData(sheet).find(function (element) {
    return element['id'] == id;
  })
  return data
}

function getDataByWhatsapp(whatsapp, sheet) {
  let data = getAllData(sheet).find(function (element) {
    return element['number'] == whatsapp;
  })
  return data;
}

function getConversations(title_id, sheet) {
  let data = getAllData(sheet).filter(function (element) {
    return element['title_id'] == title_id;
  });
  return data;
}




