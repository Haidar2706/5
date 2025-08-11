// auction.js

// Пользователи
let users = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'user', role: 'user' },
  { username: 'haidar', password: 'haidar', role: 'haidar' }
];

let userToDelete = null;

function showDeleteModal(username) {
  userToDelete = username;
  document.getElementById('deleteUserName').textContent = username;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  userToDelete = null;
  document.getElementById('deleteModal').classList.add('hidden');
}

function confirmDelete() {
  if (userToDelete) {
    deleteUser(userToDelete);
    closeDeleteModal();
  }
}

// Обновляем вызов в таблице:
// Вместо onclick="deleteUser('${user.username}')"
// Теперь:
onclick="showDeleteModal('${user.username}')"

const isLoginPage = window.location.pathname.includes('login.html');
const isCabinetOrHistory = ['cabinet.html', 'history.html'].some(page =>
  window.location.pathname.includes(page)
);

const savedUser = localStorage.getItem('auctionUser');

if (!savedUser && !isLoginPage) {
  window.location.href = 'login.html'; // редирект если не залогинен
}

if (savedUser && isCabinetOrHistory) {
  currentUser = JSON.parse(savedUser); // ✅ инициализация
}




// === Разрешение на уведомления при загрузке ===
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// === Функция браузерного уведомления ===
function showBrowserNotification(title, message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body: message, icon: "https://via.placeholder.com/64" });
  }
}

// === Звуковой сигнал при перебитой ставке ===
const bidOvertakenSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// === Массив активных ставок текущего пользователя ===
let myActiveBids = {}; // { lotId: amount }

// Заменим users, если они есть в localStorage
const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  try {
    users = JSON.parse(storedUsers);
  } catch (e) {
    console.error('Ошибка при загрузке users из localStorage:', e);
  }
}


// Лоты


let winners = [];
let lots = [
  {
    id: 1,
    title: 'Лот 1',
    category: 'Категория A',
    price: 1000,
    size: '10 кг',
    status: 'active',
    image: 'https://via.placeholder.com/100',
    bids: [],
    endTime: Date.now() + 1000 * 60 * 5
  },
  {
    id: 2,
    title: 'Лот 2',
    category: 'Категория B',
    price: 2000,
    size: '15x25 см',
    status: 'active',
    image: 'https://via.placeholder.com/100',
    bids: [],
    endTime: Date.now() + 1000 * 60 * 10
  }
];




// DOM элементы
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

const currentUserSpan = document.getElementById('currentUser');
const lotsList = document.getElementById('lotsList');
const adminPanel = document.getElementById('adminPanel');

const addLotForm = document.getElementById('addLotForm');
const newLotTitle = document.getElementById('newLotTitle');
const newLotCategory = document.getElementById('newLotCategory');
const newLotPrice = document.getElementById('newLotPrice');
const newLotStatus = document.getElementById('newLotStatus');
const newLotSize = document.getElementById('newLotSize'); // добавлен

if (loginBtn)  loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (addLotForm) addLotForm.addEventListener('submit', addLot);



const addUserForm = document.getElementById('addUserForm');
// === Debounce для поиска лотов ===
let searchTimeout;
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderLots(), 300);
  });
}



document.addEventListener('DOMContentLoaded', () => {
  const addUserForm = document.getElementById('addUserForm');
  const newUsername = document.getElementById('newUsername');
  const newPassword = document.getElementById('newPassword');
  const newUserRole = document.getElementById('newUserRole');

  if (addUserForm) {
    addUserForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const username = newUsername.value.trim();
      const password = newPassword.value;
      const role = newUserRole.value;

      if (!username || !password) {
        alert('Введите имя пользователя и пароль');
        return;
      }

      if (users.find(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует');
        return;
      }

      users.push({ username, password, role });
      localStorage.setItem('users', JSON.stringify(users));

      addUserForm.reset();
      alert(`Пользователь "${username}" добавлен`);
      // В auction.js (в обработчике добавления пользователя)


    });
  }
});


// Telegram
function sendTelegramMessage(text) {
  const token = '7816037426:AAFVg73M8KYemZl4OoY2dYGyH2jd2_2S7lw';
  const chatId = '1237960319';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

// Добавляем в auction.js
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Обновляем функцию login()
async function login() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  const hashedPassword = await hashPassword(password); // Хешируем введённый пароль
  
  const foundUser = users.find(u => u.username === username && u.password === hashedPassword);
  
  if (foundUser) {
    currentUser = foundUser;
    localStorage.setItem('auctionUser', JSON.stringify(foundUser));
    showMainPage();
  } else {
    loginError.textContent = '❌ Неверный логин или пароль';
  }
}
function logout() {
  currentUser = null;
  localStorage.removeItem('auctionUser');
  localStorage.removeItem('savedCredentials');
  localStorage.removeItem('currentUser');

  window.location.href = 'login.html'; // 🔁 Переход на страницу входа
}



function showMainPage() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');
  currentUserSpan.textContent = currentUser.username;

  if (currentUser.role === 'admin') {
    adminPanel.classList.remove('hidden');
  } else {
    adminPanel.classList.add('hidden');
  }

  renderLots();
  renderWinners();

  const lastWinner = localStorage.getItem('lastWinner');
if (lastWinner === currentUser?.username) {
  const banner = document.getElementById('winnerBanner');
  if (banner) {
    banner.classList.remove('hidden');
    banner.style.background = '#28a745';
    banner.style.color = 'white';
    banner.style.padding = '10px';
    banner.style.marginBottom = '10px';
    banner.style.borderRadius = '6px';
  }
  localStorage.removeItem('lastWinner');
}

  // ✅ Обновление таймеров
  if (!window.timerStarted) {
    window.timerStarted = true;
    setInterval(updateTimers, 1000);
  }


  // ✅ Онлайн-обновление ставок (раз в 5 сек)
  if (!window.lotsUpdater) {
    window.lotsUpdater = setInterval(() => {
      // Проверка, что пользователь авторизован и страница видима
      if (document.hasFocus() && currentUser) {
        renderLots();
      }
    }, 5000); // каждые 5 секунд
  }
}


const lastWinner = localStorage.getItem('lastWinner');
if (lastWinner === currentUser?.username) {

  showToast('🏆 Вы победили в последнем аукционе!');
  localStorage.removeItem('lastWinner'); // очищаем, чтобы не показывало снова
}



function renderLots(filteredLots = lots) {
  const tbody = document.getElementById('lotsList');
  const searchValue = document.getElementById('searchInput')?.value?.toLowerCase() || '';

  // ❗ Исключаем завершённые лоты
  filteredLots = filteredLots
    .filter(lot => lot.status !== 'sold') // скрыть завершённые
    .filter(lot => lot.title.toLowerCase().includes(searchValue)); // поиск

    filteredLots = filteredLots.filter(lot => {
    const matchesSearch = lot.title.toLowerCase().includes(searchValue);
  
    const isSoldWithBids = lot.status === 'sold' && lot.bids.length > 0;
    const isScheduled = lot.status === 'scheduled';
  
    return matchesSearch && !isSoldWithBids && !isScheduled;
  });
  
  
  // Используем DocumentFragment для быстрой вставки
  const fragment = document.createDocumentFragment();

  let totalBids = 0;
  let totalValue = 0;
  filteredLots.forEach((lot, index) => {
    const highestBid = Array.isArray(lot.bids) && lot.bids.length > 0
      ? Math.max(...lot.bids.map(b => b.amount))
      : lot.price;
      

      if (lot.status === 'active' && Array.isArray(lot.bids) && lot.bids.length > 0) {
        const bidHistoryRow = document.createElement('tr');
        bidHistoryRow.innerHTML = `
          <td colspan="10" style="text-align: left; background: #f9f9f9;">
            <b>📜 История ставок:</b><br/>
            ${lot.bids.map(b => {
              const date = new Date(b.time).toLocaleString();
              return `👤 <b>${b.user}</b>: 💰 ${b.amount} сом ${b.userSize ? `📦 <i>${b.userSize}</i>` : ''} 🕒 ${date}`;
            }).reverse().join('<br/>')}
          </td>
        `;
        tbody.appendChild(bidHistoryRow);
      }
    const remainingMs = lot.endTime ? lot.endTime - Date.now() : null;
  
    totalBids += Array.isArray(lot.bids) ? lot.bids.length : 0;
    totalValue += highestBid;
  
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${lot.title}</td>
      <td>${lot.category}</td>
      <td>${currentUser?.role === 'admin'
        ? (lot.size || '-')
        : `<input type="text" placeholder="Ваш объём" id="userSize${lot.id}" style="width: 90px;" />`
      }</td>
      <td>${lot.price} сом</td>
      <td id="highestBid${lot.id}">${highestBid} сом</td>
      <td id="status${lot.id}">${lot.status}</td>
      <td>${lot.status === 'active' && remainingMs > 0
        ? `<span id="timer${lot.id}">${formatTime(remainingMs)}</span>`
        : '—'}</td>
      <td>${lot.status === 'active'
        ? `<input type="number" id="bidAmount${lot.id}" min="${highestBid + 1}" placeholder="Ставка" style="width: 80px;" />`
        : ''}</td>
      <td>${lot.status === 'active'
        ? `<button onclick="placeBid(${lot.id})">Ставка</button>
           <button onclick="quickBid(${lot.id}, ${(highestBid + 0.5).toFixed(2)})">+0.5</button>`
        : ''}</td>
    `;
    fragment.appendChild(tr);
    // В auction.js (в renderLots())
if (lot.bids.some(b => b.user === currentUser.username)) {
  tr.classList.add('blink-animation');
}
  
    // ✅ Только для активных лотов: история ставок
    if (lot.status === 'active' && Array.isArray(lot.bids) && lot.bids.length > 0) {
      const bidHistoryRow = document.createElement('tr');
      bidHistoryRow.innerHTML = `
        <td colspan="10" style="text-align: left; background: #f9f9f9;">
          <b>📜 История ставок:</b><br/>
          ${lot.bids.map(b => {
            const date = new Date(b.time).toLocaleString();
            return `👤 <b>${b.user}</b>: 💰 ${b.amount} сом ${b.userSize ? `📦 <i>${b.userSize}</i>` : ''} 🕒 ${date}`;
          }).reverse().join('<br/>')}
        </td>
      `;
      fragment.appendChild(bidHistoryRow);
    }
  }); // ← ВОТ здесь закрывается forEach
  

  // Перерисовываем таблицу одним действием
  tbody.innerHTML = '';
  tbody.appendChild(fragment);

  document.getElementById('lotsTable').classList.remove('hidden');
  document.getElementById('statsPanel').textContent =
    `👥 Лотов: ${filteredLots.length} | 💰 Ставок: ${totalBids} | 📈 Всего: ${totalValue} сом`;
}



function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${minutes}м ${seconds < 10 ? '0' : ''}${seconds}с`;
}


  
function renderWinners() {
  if (!currentUser || currentUser.role !== 'admin') return;

  const winnersPanel = document.getElementById('winnersPanel');
  if (!winnersPanel) return; // ✅ Нет панели — выходим

  let winners = JSON.parse(localStorage.getItem('winners') || '[]');
  // ...


  // Фильтрация по дате (если нужно)
  const startDateStr = document.getElementById('filterStartDate')?.value;
  const endDateStr = document.getElementById('filterEndDate')?.value;

  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime() + 86400000;

    winners = winners.filter(w => {
      const bidTime = new Date(w.time).getTime();
      return bidTime >= start && bidTime <= end;
    });
  }

  if (winners.length === 0) {
    winnersPanel.innerHTML = "<p>🏆 Победителей пока нет</p>";
    return;
  }

  let html = `
    <h3>🏆 Победители</h3>
    <table>
      <tr>
        <th>№</th>
        <th>Лот</th>
        <th>Победитель</th>
        <th>Ставка</th>
        <th>Дата победы</th> <!-- ✅ добавили -->
      </tr>
  `;

  winners.forEach((w, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${w.title}</td>
        <td>${w.winner}</td>
        <td>${w.bid} сом</td>
        <td>${w.time || '-'}</td> <!-- ✅ отображаем дату -->
      </tr>
    `;
  });

  html += "</table>";
  winnersPanel.innerHTML = html;
}






// === Улучшенный updateTimers с уведомлением, звуком и анимацией ===

// Звуковой сигнал
const endSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

function updateTimers() {
  const now = Date.now();

  lots.forEach(lot => {
    if (lot.status === 'active' && lot.endTime) {
      const remaining = lot.endTime - now;
      const timerEl = document.getElementById(`timer${lot.id}`);
      const statusEl = document.getElementById(`status${lot.id}`);

      if (remaining > 0 && timerEl) {
        timerEl.textContent = formatTime(remaining);

        // 🔔 Уведомление за 1 минуту
        if (remaining < 60000 && !lot._warned) {
          lot._warned = true;
          endSound.play();
          showToast(`⏳ До конца лота «${lot.title}» < 1 минуты!`);
        }

        // Мигание <30 сек
        if (remaining < 30000) {
          timerEl.style.color = 'red';
          timerEl.style.fontWeight = 'bold';
          timerEl.style.animation = 'blink 1s infinite';
        } else {
          timerEl.style.color = '';
          timerEl.style.fontWeight = '';
          timerEl.style.animation = '';
        }

      } else if (remaining <= 0) {
        // ⛔ Лот завершён
        lot.status = 'sold';
        lot.bids = [];

        if (statusEl) statusEl.textContent = 'sold';
        if (timerEl) {
          timerEl.textContent = '—';
          timerEl.style.animation = '';
        }

        // ✅ Определяем победителя
        if (lot.bids.length > 0) {
          const lastBid = lot.bids[lot.bids.length - 1];

          // Загружаем победителей из LocalStorage
          let savedWinners = JSON.parse(localStorage.getItem('winners') || '[]');

          // Проверяем, нет ли уже этого победителя
          const exists = savedWinners.some(
            w => w.title === lot.title && w.winner === lastBid.user
          );

          if (!exists) {
            savedWinners.push({
              title: lot.title,
              winner: lastBid.user,
              bid: lastBid.amount,
              time: new Date().toLocaleString()  // ✅ сохраняем дату победы
            });
            if (lots.every(l => l.status === 'sold') && !nextAuctionTime) {
              nextAuctionTime = Date.now() + NEXT_AUCTION_DELAY;
              showNextAuctionBanner();
            }
            if (nextAuctionTime) {
              const remaining = nextAuctionTime - Date.now();
              const banner = document.getElementById('nextAuctionBanner');
            
              if (remaining > 0) {
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining / 1000) % 60);
                banner.innerHTML = `⏳ Следующие торги начнутся через <b>${mins}:${secs < 10 ? '0'+secs : secs}</b>`;
                banner.style.display = 'block';
              } else {
                banner.innerHTML = "✅ Торги снова открыты! Добавьте новые лоты.";
                nextAuctionTime = null;
              }
            }
            

            localStorage.setItem('winners', JSON.stringify(savedWinners));
            renderWinners();

            const now = Date.now();

            // ⏱️ Переводим запланированные лоты в активные
            lots.forEach(lot => {
             if (lot.status === 'scheduled' && lot.startTime <= now) {
              lot.status = 'active';
              }
             });
             localStorage.setItem('lots', JSON.stringify(lots));


          }
        }
      }
    }
  });
  // ✅ Удаляем завершённые лоты (все, не только со ставками)
// ✅ Переносим завершённые лоты в архив
let archived = JSON.parse(localStorage.getItem('archivedLots') || '[]');

const stillActive = [];
lots.forEach(lot => {
  if (lot.status === 'sold') {
    archived.push(lot);
  } else {
    stillActive.push(lot);
  }
});

lots = stillActive;
localStorage.setItem('lots', JSON.stringify(lots));
localStorage.setItem('archivedLots', JSON.stringify(archived));


}


// Добавим анимацию мигания в CSS через JS
const style = document.createElement('style');
style.innerHTML = `
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}`;
document.head.appendChild(style);

// В updateTimers() или где у тебя обработка окончания лотов — добавляем запись победителя
function updateTimers() {
  const now = Date.now();
  lots.forEach(lot => {
    if (lot.status === 'active' && lot.endTime) {
      const remaining = lot.endTime - now;
      const timerEl = document.getElementById(`timer${lot.id}`);
      const statusEl = document.getElementById(`status${lot.id}`);

      if (remaining > 0 && timerEl) {
        timerEl.textContent = formatTime(remaining);
        if (remaining <= 0 && lot.status !== 'sold') {
          lot.status = 'sold';
          lot.bids = [];

          const td = document.getElementById(`timer-${lot.id}`);
          if (td) td.textContent = "Завершён";
        
          if (lot.bids && lot.bids.length > 0) {
            const lastBid = lot.bids[lot.bids.length - 1];
            let winners = JSON.parse(localStorage.getItem('winners') || '[]');
        
            
({
              title: lot.title,
              winner: lastBid.user,
              bid: lastBid.amount
            });
        
            localStorage.setItem('winners', JSON.stringify(winners));
            renderWinners();
          }
        }
        
      } else if (remaining <= 0) {
        lot.status = 'sold'; // Завершить лот
        if (statusEl) statusEl.textContent = 'sold';
        if (timerEl) timerEl.textContent = '—';
        renderLots(); // Перерисовать таблицу
        
        // Добавляем победителя
        let winners = JSON.parse(localStorage.getItem('winners') || '[]');
        if (lot.bids.length > 0) {
          const lastBid = lot.bids[lot.bids.length - 1];
          // Проверяем, чтобы победитель не дублировался
          const alreadyExists = winners.some(w => w.title === lot.title && w.winner === lastBid.user);
          if (!alreadyExists) {
            winners.push({
              title: lot.title,
              winner: lastBid.user,
              bid: lastBid.amount,
              time: new Date().toLocaleString()  // ✅ сохраняем дату
            });
            // запоминаем последнего победителя
            localStorage.setItem('lastWinner', lastBid.user);

            sendTelegramMessage(`🏆 <b>Поздравляем!</b>
            <b>Победитель:</b> ${lastBid.user}
            <b>Лот:</b> ${lot.title}
            <b>Ставка:</b> ${lastBid.amount} сом
            <b>Дата:</b> ${new Date().toLocaleString()}`);

            localStorage.setItem('winners', JSON.stringify(winners));
            
            renderWinners();
           


          }
        }
      }
    }
  });
}



// Вызов renderWinners после renderLots, чтобы обновлять панель
function showMainPage() {
  const loginPage = document.getElementById('loginPage');
  const mainPage = document.getElementById('mainPage');

  if (loginPage) loginPage.classList.add('hidden');
  if (mainPage) mainPage.classList.remove('hidden');

  if (currentUserSpan) currentUserSpan.textContent = currentUser.username;

  if (currentUser.role === 'admin') {
    adminPanel?.classList.remove('hidden');
  } else {
    adminPanel?.classList.add('hidden');
  }

  renderLots();
  renderWinners();

  if (!window.timerStarted) {
    window.timerStarted = true;
    setInterval(updateTimers, 1000);
  }
  if (currentUser.role === 'admin') {
    adminPanel.classList.remove('hidden');
    loadUsersHistory(); // ← Загружаем историю!
  }
}


function placeBid(lotId) {
  const input = document.getElementById(`bidAmount${lotId}`);
  const amount = parseFloat(input?.value);
  const lot = lots.find(l => l.id === lotId);
  if (!lot) return alert('❌ Лот не найден');

  const highestBid = lot.bids.length ? Math.max(...lot.bids.map(b => b.amount)) : lot.price;

  // ✅ Проверка минимальной суммы ставки
  if (isNaN(amount) || amount < lot.minBid || amount <= highestBid) {
    return alert(`❌ Ставка должна быть больше ${highestBid} и не ниже мин. ставки ${lot.minBid}`);
  }

  // ✅ Проверка объёма
  let userSize = '';
  const userSizeInput = document.getElementById(`userSize${lotId}`);

  if (currentUser.role !== 'admin') {
    if (!userSizeInput || !userSizeInput.value.trim()) {
      alert('❗ Пожалуйста, укажите объём перед ставкой');
      return;
    }

    userSize = userSizeInput.value.trim();
    const userVolume = parseFloat(userSize);

    if (isNaN(userVolume) || userVolume < lot.minVolume) {
      alert(`❌ Объём должен быть не менее ${lot.minVolume}`);
      return;
    }

  } else {
    userSize = lot.size || '';
  }

  // ✅ Сохраняем ставку
  lot.bids.push({ user: currentUser.username, amount, time: Date.now(), userSize });
  myActiveBids[lotId] = amount;

  // ⏰ Продление при ставке в последние 2 минуты
  const now = Date.now();
  const remaining = lot.endTime - now;
  const EXTEND_THRESHOLD = 2 * 60 * 1000;
  if (remaining > 0 && remaining < EXTEND_THRESHOLD) {
    lot.endTime = now + EXTEND_THRESHOLD;
  }

  input.value = '';
  if (userSizeInput) userSizeInput.value = '';


  // Telegram уведомление
  sendTelegramMessage(
    `💸 <b>Ставка:</b> ${amount} сом\n<b>Пользователь:</b> ${currentUser.username}` +
    (userSize ? `\n<b>Объём:</b> ${userSize}` : '') +
    `\n<b>Лот:</b> ${lot.title}`
  );

  renderLots();
  showToast(`✅ Ставка принята: ${amount} сом`);

  localStorage.setItem('lots', JSON.stringify(lots));
}

function addLot(event) {
  event.preventDefault();

  const title = document.getElementById('newLotTitle').value.trim();
  const price = parseFloat(document.getElementById('newLotPrice').value);
  const size = document.getElementById('newLotSize').value.trim();
  const category = document.getElementById('newLotCategory').value.trim();
  const status = document.getElementById('newLotStatus').value;
  const startTimeStr = document.getElementById('newLotStartTime').value;
  const endTimeStr = document.getElementById('newLotEndTime').value;

  const startTime = new Date(startTimeStr).getTime();
  const endTime = new Date(endTimeStr).getTime();

  if (!title || isNaN(price) || !category || !size || !startTime || !endTime || startTime >= endTime) {
    alert("❗ Проверьте все поля: Название, Цена, Размер, Даты начала и окончания");
    return;
  }

  const lot = {
    id: Date.now(),
    title,
    category,
    price,
    size,
    status: startTime > Date.now() ? 'scheduled' : 'active',
    startTime,
    endTime,
    bids: []
  };

  lots.push(lot);
  localStorage.setItem('lots', JSON.stringify(lots));

  renderLots();
  event.target.reset();
  alert("✅ Лот добавлен");
}




// ===== JSON Сохранение и Загрузка =====

function saveToLocalStorage() {
  localStorage.setItem('lots', JSON.stringify(lots));
  localStorage.setItem('users', JSON.stringify(users));
  const data = { users, lots };
  localStorage.setItem('auctionData', JSON.stringify(data));
  alert('Сохранено в LocalStorage');
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('auctionData'));
  if (data) {
    if (Array.isArray(data.users)) users.splice(0, users.length, ...data.users);
    if (Array.isArray(data.lots)) lots = data.lots;
    alert('Загружено из LocalStorage');
    renderLots();
  } else {
    alert('Нет сохранённых данных');
  }
}

function downloadJSON() {
  const data = { users, lots };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'auction-data.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function uploadJSONFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.users)) users.splice(0, users.length, ...data.users);
      if (Array.isArray(data.lots)) lots = data.lots;
      alert('Загружено из файла!');
      renderLots();
    } catch (err) {
      alert('Ошибка при чтении JSON');
    }
  };
  reader.readAsText(file);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#28a745';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  toast.style.zIndex = 10000;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    // Ожидаем поля: title, category, price, size, endTime (в формате "YYYY-MM-DDTHH:MM")
    json.forEach((row, index) => {
      if (row.title && row.category && row.price && row.size && row.endTime) {
        lots.push({
          id: lots.length + 1,
          title: row.title,
          category: row.category,
          price: parseFloat(row.price),
          size: row.size,
          image: 'https://via.placeholder.com/100',
          status: 'active',
          bids: [],
          endTime: new Date(row.endTime).getTime()
        });
      }
    });

    renderLots();
    alert('Лоты из Excel загружены!');
  };

  reader.readAsArrayBuffer(file);
}
// Загрузка победителей из localStorage
winners = JSON.parse(localStorage.getItem('winners')) || [];

// Отрисовка победителей (если админ)
renderWinners();


function quickBid(lotId, newAmount) {
  const lot = lots.find(l => l.id === lotId);
  if (!lot) return alert('Лот не найден');

  const highestBid = lot.bids.length ? Math.max(...lot.bids.map(b => b.amount)) : lot.price;
  

  // Если кто-то сделал ставку после рендера — проверим снова
  if (newAmount <= highestBid) {
    newAmount = highestBid + 100;
    
  }

  // Для обычного пользователя нужен объём
  let userSize = '';
  const userSizeInput = document.getElementById(`userSize${lotId}`);
  if (currentUser.role !== 'admin') {
    if (!userSizeInput || !userSizeInput.value.trim()) {
      alert('Пожалуйста, укажите объём перед ставкой');
      return;
    }
    userSize = userSizeInput.value.trim();
  } else {
    userSize = lot.size || '';
  }

  // Сохраняем ставку
  lot.bids.push({
    user: currentUser.username,
    amount: newAmount,
    time: Date.now(),
    userSize
  });

  // Запоминаем мою активную ставку
  myActiveBids[lotId] = newAmount;

  // Продлеваем время, если <2 минут
  const now = Date.now();
  const remaining = lot.endTime - now;
  if (remaining > 0 && remaining < 2 * 60 * 1000) {
    lot.endTime = now + 2 * 60 * 1000;
  }

  // Telegram уведомление
  sendTelegramMessage(
    `💸 <b>Быстрая ставка:</b> ${newAmount} сом\n<b>Пользователь:</b> ${currentUser.username}` +
    (userSize ? `\n<b>Объём:</b> ${userSize}` : '') +
    `\n<b>Лот:</b> ${lot.title}`
  );

  renderLots();
  showToast(`✅ Ставка +100 принята: ${newAmount} сом`);

  localStorage.setItem('lots', JSON.stringify(lots));
}
function downloadHistoryExcel() {
  const rows = [];
  document.querySelectorAll('#historyBody tr').forEach(tr => {
    const cols = tr.querySelectorAll('td');
    rows.push({
      "Лот": cols[0].textContent,
      "Ставка": cols[1].textContent,
      "Дата": cols[2].textContent,
      "Статус": cols[3].textContent
    });
  });

  if (rows.length === 0) {
    alert("Нет данных для экспорта");
    return;
  }

  // Создаём Excel-файл
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "История ставок");

  // Генерируем и скачиваем
  XLSX.writeFile(wb, `my-bids-history.xlsx`);
}
function downloadWinnersExcel() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('❌ Только админ может скачать победителей');
    return;
  }

  const winners = JSON.parse(localStorage.getItem('winners') || '[]');

  if (!winners.length) {
    alert('Нет завершённых лотов с победителями');
    return;
  }

  // Формируем массив для Excel
  const rows = winners.map((w, i) => ({
    "№": i + 1,
    "Лот": w.title,
    "Победитель": w.winner,
    "Ставка": w.bid,
    "Дата": w.time || '-'
  }));
  

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Победители");

  XLSX.writeFile(wb, `auction-winners.xlsx`);
}
function clearWinners() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('❌ Только админ может очистить победителей');
    return;
  }

  if (!confirm('Вы уверены, что хотите очистить список победителей?')) return;

  localStorage.removeItem('winners');  // Удаляем из хранилища
  winners = [];                        // Очищаем переменную
  const panel = document.getElementById('winnersPanel');
  if (panel) panel.innerHTML = '<p>🏆 Победителей пока нет</p>';
  
  alert('✅ Список победителей очищен!');
}
let nextAuctionTime = null; 
const NEXT_AUCTION_DELAY = 5 * 60 * 1000; // 5 минут ожидания




function loginUser() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const currentUser = users.find(u => u.username === username && u.password === password);
  if (!currentUser) {
    document.getElementById('loginError').textContent = '❌ Неверный логин или пароль';
    return;
  }

  // ✅ Сохраняем данные
  localStorage.setItem('auctionUser', JSON.stringify(currentUser));
  localStorage.setItem('savedCredentials', JSON.stringify({ username, password }));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // 🏆 Победитель
  const lastWinner = localStorage.getItem('lastWinner');
  if (lastWinner === username) {
    localStorage.setItem('pendingToast', '🏆 Вы победили в последнем аукционе!');
    localStorage.removeItem('lastWinner');
  }

  // ✅ Переход на главную
  window.location.href = 'index.html?from=cabinet';
}

function submitFeedback() {
  const text = document.getElementById('feedbackText').value.trim();
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!text) {
    alert("Пожалуйста, введите сообщение");
    return;
  }

  const message = `💬 <b>Обратная связь</b>\n👤 Пользователь: ${user.username || "Гость"}\n✉️ Сообщение:\n${text}`;

  sendTelegramMessage(message)
    .then(() => {
      showToast("✅ Спасибо за отзыв!");
      document.getElementById('feedbackText').value = '';
    })
    .catch(() => {
      alert("❌ Ошибка при отправке сообщения");
    });
}
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function renderSoonLots() {
  const soonLotsBody = document.getElementById('soonLotsBody');
  soonLotsBody.innerHTML = '';

  const now = Date.now();
  const soonLots = lots.filter(lot => lot.status === 'scheduled');

  if (soonLots.length === 0) {
    soonLotsBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">😴 Пока нет запланированных лотов</td></tr>`;
    return;
  }

  soonLots.forEach((lot, index) => {
    const start = new Date(lot.startTime).toLocaleString();
    soonLotsBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${lot.title}</td>
        <td>${lot.category}</td>
        <td>${lot.size || '-'}</td>
        <td>${lot.price} сом</td>
        <td>${start}</td>
      </tr>
    `;
  });
}


function toggleView(view) {
  document.getElementById('soonLots').style.display = view === 'soon' ? 'block' : 'none';
  document.getElementById('lotsTable').style.display = view === 'soon' ? 'none' : 'block';

  if (view === 'soon') {
    renderSoonLots();
  } else {
    renderLots();
  }
}
function showModal(message) {
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}
function filterMyBids() {
  const filtered = lots.filter(lot =>
    lot.bids.some(b => b.user === currentUser.username)
  );
  renderLots(filtered);
}
window.onload = () => {
  const savedUser = localStorage.getItem('auctionUser');
  const fromCabinet = window.location.search.includes('from=cabinet');

  if (savedUser && fromCabinet) {
    currentUser = JSON.parse(savedUser);
    showMainPage();
  }

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', login);
  }
};

function renderMyWins() {
  if (!currentUser) return;
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const myWins = winners.filter(w => w.winner === currentUser.username);

  const table = document.getElementById('myWinsTable');
  table.innerHTML = `<tr><th>Лот</th><th>Ставка</th><th>Дата</th></tr>`;

  if (myWins.length === 0) {
    table.innerHTML += `<tr><td colspan="3" style="text-align:center;">Побед нет</td></tr>`;
  } else {
    myWins.forEach(w => {
      table.innerHTML += `
        <tr>
          <td>${w.title}</td>
          <td>${w.bid} сом</td>
          <td>${w.time || '—'}</td>
        </tr>
      `;
    });
  }
}
if (window.location.pathname.includes('cabinet.html')) {
  document.getElementById('cabinetUser').textContent = currentUser?.username || 'Гость';
  renderMyWins();
}
if (window.location.pathname.includes('cabinet.html')) {
  currentUser = JSON.parse(localStorage.getItem('auctionUser') || '{}');
  document.getElementById('cabinetUser').textContent = currentUser.username || 'Гость';
  renderMyWins();
}
// В auction.js
window.addEventListener('storage', (e) => {
  if (e.key === 'lots') {
    renderLots(); // Перерисовываем, если кто-то изменил лоты
  }
});

function loadUsersHistory() {
  if (!currentUser || currentUser.role !== 'admin') return;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const lots = JSON.parse(localStorage.getItem('lots') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const roleFilter = document.getElementById('userRoleFilter').value;
  
  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );
  
  const tbody = document.getElementById('usersHistoryBody');
  tbody.innerHTML = '';
  
  filteredUsers.forEach(user => {
    // Статистика пользователя
    const userBids = lots.flatMap(lot => 
      lot.bids.filter(bid => bid.user === user.username)
    );
    
    const userWins = winners.filter(win => win.winner === user.username);
    
    // Добавляем строку в таблицу
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id || '—'}</td>
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>${userBids.length}</td>
      <td>${userWins.length}</td>
      <td>${user.registrationDate || 'Не указана'}</td>
      <td>
    <button 
      onclick="deleteUser('${user.username}')" 
      class="btn-delete"
      ${user.role === 'admin' ? 'disabled' : ''}
    >
      🗑️ Удалить
    </button>
    `;
    tbody.appendChild(tr);
  });
}
function downloadUsersExcel() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('❌ Только для администраторов!');
    return;
  }
  
  const rows = [];
  document.querySelectorAll('#usersHistoryBody tr').forEach(tr => {
    const cols = tr.querySelectorAll('td');
    rows.push({
      "ID": cols[0].textContent,
      "Логин": cols[1].textContent,
      "Роль": cols[2].textContent,
      "Ставок": cols[3].textContent,
      "Побед": cols[4].textContent,
      "Дата регистрации": cols[5].textContent
    });
  });
  
  if (rows.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Пользователи");
  XLSX.writeFile(wb, "users-history.xlsx");
}
function deleteUser(username) {
  // Проверка прав администратора
  if (!currentUser || currentUser.role !== 'admin') {
    alert('❌ Только администратор может удалять пользователей!');
    return false;
  }

  // Защита от удаления самого себя
  if (username === currentUser.username) {
    alert('❌ Нельзя удалить самого себя!');
    return false;
  }

  // Подтверждение действия
  if (!confirm(`Удалить пользователя ${username}? Все его ставки будут сохранены как анонимные.`)) {
    return false;
  }

  try {
    // 1. Удаляем из списка пользователей
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(user => user.username !== username);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // 2. Анонимизируем ставки
    const lots = JSON.parse(localStorage.getItem('lots')) || [];
    lots.forEach(lot => {
      if (lot.bids && Array.isArray(lot.bids)) {
        lot.bids.forEach(bid => {
          if (bid.user === username) {
            bid.user = "[Удалён]";
          }
        });
      }
    });
    localStorage.setItem('lots', JSON.stringify(lots));

    // 3. Обновляем интерфейс
    showToast(`✅ Пользователь ${username} удалён`);
    loadUsersHistory();
    return true;
    
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    alert('❌ Произошла ошибка при удалении');
    return false;
  }
}

function placeBid(lotId) {
  if (!currentUser) return;
  
  const lotRef = ref(db, `lots/${lotId}`);
  get(lotRef).then((snapshot) => {
    const lot = snapshot.val();
    // Проверки и логика ставки
    
    // Атомарное обновление
    set(lotRef, {
      ...lot,
      bids: [...lot.bids, newBid],
      endTime: newEndTime
    });
  });
}
function setupBidNotifications() {
  const bidsRef = ref(db, 'lots');
  onChildChanged(bidsRef, (snapshot) => {
    const changedLot = snapshot.val();
    if (changedLot.bids && changedLot.bids.length > 0) {
      const lastBid = changedLot.bids[changedLot.bids.length - 1];
      if (lastBid.user !== currentUser.username) {
        showToast(`Новая ставка на лот ${changedLot.title}: ${lastBid.amount} сом`);
      }
    }
  });
}// Подписка на уведомления
function setupNotifications() {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    showToast(payload.notification.body);
  });
}

// Отправка уведомления (серверная часть)
// Пример для Node.js:
app.post("/send-notification", (req, res) => {
  const { userId, message } = req.body;
  admin.messaging().sendToDevice(userToken, {
    notification: { title: "Аукцион", body: message }
  });
  res.send("OK");
});
function logAction(action, lotId, details) {
  const logRef = ref(db, "audit_logs");
  push(logRef, {
    user: currentUser.username,
    action: action, // "BID_PLACED", "LOT_UPDATED"
    lotId: lotId,
    details: details,
    time: Date.now()
  });
}

// Пример использования:
logAction("BID_PLACED", lotId, { amount: bidAmount });
// Проверка задержки
let lastBidTime = 0;

function placeBid(lotId) {
  if (Date.now() - lastBidTime < 5000) {
    showToast("❌ Слишком часто! Подождите 5 сек.");
    return;
  }
  lastBidTime = Date.now();
  // ...остальная логика
}
// Обновление рейтинга
function updateRating(username, score) {
  const userRef = ref(db, `users/${username}`);
  runTransaction(userRef, (user) => {
    if (!user) return user;
    user.rating = (user.rating || 0) + score;
    return user;
  });
}

function reportUser(lotId, bidId, reason) {
  const reportRef = ref(db, "reports");
  push(reportRef, {
    reporter: currentUser.username,
    lotId: lotId,
    bidId: bidId,
    reason: reason,
    time: Date.now()
  });
  showToast("Жалоба отправлена модераторам.");
}
// Firebase Cloud Function для бэкапа
exports.backupData = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const lots = await admin.database().ref('lots').once('value');
  const users = await admin.database().ref('users').once('value');
  const backup = { lots: lots.val(), users: users.val() };
  await admin.storage().bucket().file(`backups/${Date.now()}.json`).save(JSON.stringify(backup));
});