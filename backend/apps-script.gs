const SHEET_ID = 'ВСТАВЬТЕ_ID_GOOGLE_ТАБЛИЦЫ';
const VK_ACCESS_TOKEN = '';
const VK_PEER_ID = '';

function doGet() {
  const payload = {
    products: readSheet('Товары'),
    promos: readSheet('Промокоды'),
    banners: readSheet('Баннеры'),
  };
  return json(payload);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    body = {};
  }
  if (body.action === 'order') return handleOrder(body.order);
  return json({ result: 'ignored' });
}

function handleOrder(order) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Заказы');
  if (!sheet) sheet = ss.insertSheet('Заказы');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['время', 'id', 'клиент', 'телефон', 'адрес', 'слот', 'состав', 'сумма', 'оплата', 'статус']);
  }
  sheet.appendRow([
    new Date(),
    order.orderId || '',
    order.customer || '',
    order.phone || '',
    order.address || '',
    order.slot || '',
    order.itemsText || '',
    order.total || 0,
    order.payment || '',
    'новый',
  ]);
  notifyVK('Новый заказ №' + order.orderId + ' на ' + order.total + ' ₽ от ' + order.customer);
  return json({ result: 'saved' });
}

function notifyVK(text) {
  if (!VK_ACCESS_TOKEN || !VK_PEER_ID) return;
  UrlFetchApp.fetch('https://api.vk.com/method/messages.send', {
    method: 'post',
    payload: {
      access_token: VK_ACCESS_TOKEN,
      peer_id: VK_PEER_ID,
      message: text,
      v: '5.199',
      random_id: Date.now(),
    },
    muteHttpExceptions: true,
  });
}

function readSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getDisplayValues();
  const head = rows[0];
  return rows
    .slice(1)
    .filter(function (r) {
      return r[0];
    })
    .map(function (r) {
      const obj = {};
      head.forEach(function (h, i) {
        obj[String(h).trim()] = r[i];
      });
      return obj;
    });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
