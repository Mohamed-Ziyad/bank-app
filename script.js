'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'admin',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-04-22T14:43:26.374Z',
    '2021-04-23T18:49:59.371Z',
    '2021-04-24T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2021-04-22T14:43:26.374Z',
    '2021-04-23T18:49:59.371Z',
    '2021-04-24T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const makeDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    day: 'numeric',
    month: 'numeric', //'long', //2-digits, numeric
    year: 'numeric', //2-digit
    weekday: 'long', //short, narrow
  };

  //get the local language code
  const local = navigator.language;

  return new Intl.DateTimeFormat(locale, options).format(now);
};

const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = makeDate(new Date(account.movementsDates[i]), account.locale);

    const calcDaysPassed = (date1, date2) =>
      Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
    const formattedMov = formatCur(mov, account.locale, account.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${date}</div>
        <div class="movements__value">${formattedMov}</div>
      
      </div>

    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedMov = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formattedMov}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers

//---Fake always logged in
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    let todayIs = makeDate(new Date());
    labelDate.textContent = todayIs;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //adding date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    //reset timer when transfer money
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); //math floor convert the string to int

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //making the process delay 3 sec using async settimeout funct
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      //adding date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

const startLogOutTimer = () => {
  const tick = () => {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  //set time to 5 mins
  let time = 20;
  //call the timer every second
  tick(); //to start the count without delay
  const timer = setInterval(tick, 1000);
  return timer;
  // In each call, print the remaining time

  //logout after times end
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//returns boolean
//Conversion
// console.log(Number('23'));
// console.log(+'23'); //short cut typr coarsion

// //parsing
// //numbers with charectors 3px
// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('px34', 10)); //not work

// console.log(Number.parseInt('3.4rem')); //give the int
// console.log(Number.parseFloat('3.5rem'));

// //checking not a number
// console.log(Number.isNaN(20)); //false
// console.log(Number.isNaN('20')); //false
// console.log(Number.isNaN(+'20x')); //true
// console.log(Number.isNaN(23 / 0)); //false because it's infinity

// //checking is a number
// console.log(Number.isFinite(20)); //true
// console.log(Number.isFinite('20')); //false
// console.log(Number.isFinite(+'20')); //false
// console.log(Number.isFinite(20 / 0)); //false

// //checking Int
// console.log(Number.isInteger(20));
// console.log(Number.isInteger(20.0));
// console.log(Number.isInteger(20 / 0));

// //squre root
// console.log(Math.sqrt(25));
// //or
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3)); //cubic root

// //Find max
// console.log(Math.max(5, 12, 45, 13, 24));
// console.log(Math.max(5, '12', 45, 13, 24));
// console.log(Math.max(5, '12px', 45, 13, 24));

// //find min
// console.log(Math.min(5, 12, 45, 13, 24));

// //pi
// console.log(Math.PI * Number.parseInt('10px') ** 2);
// //console.log(4 ** 2);

// //math rondom
// console.log(Math.trunc(Math.random() * 5 + 1));

// //rondom int
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 5));

// //rounding integers
// console.log(Math.trunc(23.3));
// //nearest initeger
// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.9)); //24
// console.log(Math.ceil(23.3)); //24

// console.log(Math.floor(23.3)); //23
// console.log(Math.floor(23.9)); //23

// //negative
// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

// //roundng decimals
// console.log((2.7).toFixed(0)); //return a string 3 whole number
// console.log((2.7).toFixed(3)); //2.700
// console.log((2.734).toFixed(2)); //27.34
// //remainder
// console.log(5 % 2 === 1);
// console.log(5 / 2);

// //is even or odd
// const isEven = n => n % 2 === 0;

// console.log(isEven(8));
// console.log(isEven(7));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
//     if (i % 2 === 0) row.style.backgroundColor = 'gray';
//   });
// });

// //create a date
// const now = new Date();
// console.log(now);

// //using string
// console.log(new Date('December 24,2015'));

// //months are 0 based
// console.log(new Date(2037, 11, 19, 15, 23, 3));

// //auto corrects date
// console.log(new Date(2037, 10, 31));

// console.log(new Date(0));

// //days to milli second
// console.log(3 * 24 * 60 * 60 * 1000);

// //working with dates
// const future = new Date(2037, 11, 19, 15, 23);

// console.log(future);

// console.log(future.getFullYear());

// console.log(future.getMonth());

// console.log(future.getDate());

// console.log(future.getDay());

// console.log(future.getHours());

// console.log(future.getMinutes());

// console.log(future.getSeconds());

// console.log(future.toISOString());

// console.log(future.getTime());

// console.log(new Date(2144829180000));

// //current time
// console.log(Date.now());

// //manupulate future date obj
// future.setFullYear(2040);
// console.log(future);

// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 25));
// console.log(days1);

//Language code symbol
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long', //2-digits, numeric
  year: 'numeric', //2-digit
  weekday: 'long', //short, narrow
};

//get the local language code
const local = navigator.language;
console.log(new Intl.DateTimeFormat(local, options).format(now));

const num = 3884764.23;

console.log('US: ', new Intl.NumberFormat('en-US').format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE').format(num));
console.log('Syria: ', new Intl.NumberFormat('de-DE').format(num));

//async
setTimeout(() => console.log('Here is your pizza'), 3000);
setTimeout(
  (val1, val2) => console.log(`Here is your ${val1} and ${val2}`),
  3000,
  'pizza',
  'pizza2'
);
console.log('waiting');

//with arrays
const ingredients = ['olives', 'spinach'];

const pizzaTime = setTimeout(
  (val1, val2) => console.log(`Here is your ${val1} and ${val2}`),
  3000,
  ...ingredients
);

if (ingredients.includes('spinach4')) clearTimeout(pizzaTime);

const setInter = setInterval(() => {
  const now = new Date();
  console.log(now);
}, 1000);

clearInterval(setInter);
