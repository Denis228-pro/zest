const SHEET_ID = 'ВСТАВЬТЕ_ID_GOOGLE_ТАБЛИЦЫ';
const VK_ACCESS_TOKEN = '';
const VK_PEER_ID = '';

const STATUS_MAP = {
  'новый': 'accepted',
  'собираем': 'assembling',
  'собран': 'assembling',
  'в пути': 'transit',
  'доставлен': 'delivered',
  'отменён': 'cancelled',
  'отменен': 'cancelled',
};

function doGet(e) {
  const payload = {
    products: readSheet('Товары'),
    promos: readSheet('Промокоды'),
    banners: readSheet('Баннеры'),
    statuses: readStatuses(),
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
  if (body.action === 'cancel') return handleCancel(String(body.orderId || ''), String(body.device || ''));
  if (body.action === 'review') return handleReview(body.review || {});
  return json({ result: 'ignored' });
}

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function handleOrder(order) {
  const sheet = getSheet('Заказы');
  if (!sheet) return json({ result: 'error: no sheet' });
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['время', 'id', 'клиент', 'телефон', 'адрес', 'слот', 'состав', 'сумма', 'оплата', 'статус', 'device']);
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
    order.device || '',
  ]);
  notifyVK('Новый заказ #' + order.orderId + ' на ' + order.total + ' ₽ от ' + order.customer);
  return json({ result: 'saved' });
}

function handleCancel(orderId, device) {
  const sheet = getSheet('Заказы');
  if (!sheet || sheet.getLastRow() < 2) return json({ result: 'not found' });
  const rows = sheet.getDataRange().getDisplayValues();
  const head = rows[0];
  const idI = head.indexOf('id');
  const stI = head.indexOf('статус');
  const devI = head.indexOf('device');
  if (idI < 0 || stI < 0) return json({ result: 'error' });
  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    if (row[idI] === orderId && (!device || devI < 0 || row[devI] === device)) {
      sheet.getRange(i + 1, stI + 1).setValue('отменён');
      return json({ result: 'cancelled' });
    }
  }
  return json({ result: 'not found' });
}

function handleReview(review) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Отзывы');
  if (!sheet) {
    sheet = ss.insertSheet('Отзывы');
    sheet.appendRow(['время', 'заказ', 'оценка', 'отзыв', 'имя']);
  }
  sheet.appendRow([
    new Date(),
    review.orderId || '',
    review.rating || '',
    review.text || '',
    review.name || '',
  ]);
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

function readStatuses() {
  const sheet = getSheet('Заказы');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getDisplayValues();
  const head = rows[0];
  const idI = head.indexOf('id');
  const stI = head.indexOf('статус');
  if (idI < 0 || stI < 0) return [];
  return rows
    .slice(1)
    .filter(function (r) {
      return r[idI];
    })
    .map(function (r) {
      return { id: r[idI], status: r[stI] };
    });
}

function readSheet(name) {
  const sheet = getSheet(name);
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
