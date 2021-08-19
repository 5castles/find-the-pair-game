const $gameStartContainer = document.querySelector('.game-start');
const $gameStartButton = document.querySelector('.game-start__button');
const $gameBoard = document.querySelector('.game-board');
const $statusContainer = document.querySelector('.status-bar');
const $restAnswerCount = document.querySelector('.status-bar__rest-answer-count');
const $gameTimer = document.querySelector('.status-bar__timer');
const $resultContainer = document.querySelector('.result');
const $resultImage = document.querySelector('.result__img');

const CLASSNAME_NO_SHOW = 'no-show';
const CLASSNAME_NO_POINTER_EVENT = 'no-pointer-event';

const DEFAULT_SOURCE = './images/default.png';
const FAIL_IMG_SOURCE = './images/default.png'; //
const SUCCESS_IMG_SOURCE = './images/success.png';


const TOTAL_GOAL_POINT = 8;
let restAnswerCount = TOTAL_GOAL_POINT;
let correctPoint = 0;

const TIME_LIMIT = 50;
let timeLimit = TIME_LIMIT;
let timerId = null;

const generateNumberPool = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
};

const imagePool = [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8 ];
const shuffledOrderList = [];
const shuffledSourceList = [];


function startTimer() {
  timeLimit = TIME_LIMIT;

  timerId = setInterval(() => {
    $gameTimer.textContent = `남은 시간 : ${--timeLimit}`;

    //시간초과시 1.타이머정지[o] 2. 실패 보여주기[o] 3. 실패 효과음 [ ]
    if (timeLimit === 0) {
      clearInterval(timerId);
      showEnding(false);
    };
  }, 1000);
}

function shuffleImagesOrder() {
  for (let i = 0; i < 16; i++) {
    let generatedNumber = Math.floor(Math.random() * 16);

    //이미 사용되어 삭제된 것이면, 새로 숫자 생성하여 할당하기.
    // ! 연산자 와 in 연산자 우선순위!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    while (!(generatedNumber in generateNumberPool)) {
      let generatedNumberInsideWhile = Math.floor(Math.random() * 16);
      generatedNumber = generatedNumberInsideWhile;
    }

    shuffledOrderList.push(generateNumberPool[generatedNumber]);
    delete generateNumberPool[generatedNumber];
  }

  shuffledOrderList.forEach((number) => {
    const src = `./images/${imagePool[number]}.png`;
    shuffledSourceList.push(src);
  })

  console.log(shuffledOrderList)
  console.log(shuffledSourceList)
}


$gameStartContainer.addEventListener('click', handleGameStartButtonClick = (event) => {
  event.currentTarget.classList.add(CLASSNAME_NO_SHOW);
  $gameBoard.classList.remove(CLASSNAME_NO_SHOW);
  $statusContainer.classList.remove(CLASSNAME_NO_SHOW);

  startTimer();
  shuffleImagesOrder();
});


let clickCount = 0;
const toCompareImageSourceList = [];
const toCompareElementList = [];

$gameBoard.addEventListener('click', handleCellClick);

function handleCellClick(event) {
  if (event.target === event.currentTarget) { return; }

  const $clicked = event.target;
  $clicked.src = shuffledSourceList[$clicked.dataset.index];

  toCompareElementList.push($clicked)
  toCompareImageSourceList.push($clicked.src);
  clickCount++;

  console.log(clickCount);
  console.log(toCompareImageSourceList)
  console.log(toCompareElementList)

  if (clickCount === 2) {
    checkTheAnswer(toCompareElementList);
  }
}

function checkTheAnswer(elementList) {
  //오답인 경우
  if (!(toCompareImageSourceList[0] === toCompareImageSourceList[1])) {
    backToDefaultAndReset();
    console.log('오답 !')
  } else if (toCompareImageSourceList[0] === toCompareImageSourceList[1]) {
    console.log(toCompareImageSourceList)
    console.log('정답!!!!!!!!!')

    //맞춘갯수 +1 [o]
    //데이터리셋해주기 [o]
    //다시 클릭못하게 만들기 no-pointer-event [o]
    //더블클릭 방지  [ ]
    //정답 효과음 [ ]
    elementList.forEach((element) => {
      element.classList.add(CLASSNAME_NO_POINTER_EVENT);
    });

    increaseCorrectPoint();
    resetCheckingTools();

  }
}

//비동기  await  async  promise?
function backToDefaultAndReset() {
  setTimeout(function() {
    toCompareElementList.forEach((element) => {
      element.src = DEFAULT_SOURCE;
    });
    console.log("TIMEOUT 실행");

    //Q. 분리하면 setTimeout콜백함수 실행전에 되버림..
    resetCheckingTools();
  }, 300);
}

function resetCheckingTools() {
  toCompareImageSourceList.length = 0;
  toCompareElementList.length = 0;
  clickCount = 0;
}

function increaseCorrectPoint() {
  $restAnswerCount.textContent = `남은 뚱이 : ${--restAnswerCount}`;

  correctPoint++;

  // 다 맞췄으면 1. 타이머 멈추기 [ o ] . 2. 정답화면보여주기 [ o ] 3.성공 효과음 [ o ]
  if (correctPoint === TOTAL_GOAL_POINT) {
    clearInterval(timerId);
    showEnding(true);
  }
}

function showEnding(boolean) {
  $resultImage.src = boolean ? SUCCESS_IMG_SOURCE : FAIL_IMG_SOURCE;

  $gameBoard.classList.add(CLASSNAME_NO_SHOW);
  $statusContainer.classList.add(CLASSNAME_NO_SHOW);
  $resultContainer.classList.remove(CLASSNAME_NO_SHOW);
}
