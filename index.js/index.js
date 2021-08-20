const $gameStartContainer = document.querySelector('.game-start');
const $gameStartButton = document.querySelector('.game-start__button');
const $gameBoard = document.querySelector('.game-board');
const $statusContainer = document.querySelector('.status-bar');
const $restAnswerCountText = document.querySelector('.status-bar__rest-answer-count');
const $gameTimer = document.querySelector('.status-bar__timer');
const $resultContainer = document.querySelector('.result');
const $resultImage = document.querySelector('.result__img');
const $resultText = document.querySelector('.result__text');
const $restartButton = document.querySelector('.result__restart-button');

const $backgroundMusic = document.querySelector('.audio-background-music');
const $pickSound = document.querySelector('.audio-pick');
const $correctSound = document.querySelector('.audio-correct');
const $gameFailSound = document.querySelector('.audio-game-fail');
const $gameSuccessSound = document.querySelector('.audio-game-success');

const CLASSNAME_DISPLAY_NONE = 'display-none';
const CLASSNAME_NO_POINTER_EVENT = 'no-pointer-event';

const DEFAULT_IMG_SOURCE = './images/default.png';
const FAIL_IMG_SOURCE = './images/default.png'; //
const SUCCESS_IMG_SOURCE = './images/success.png';

const TOTAL_GOAL_POINT = 8;
let restAnswerCount = null;
let correctPoint = null;

const TIME_LIMIT_SECONDS = 5;
let timeLimit = null;
let timerId = null;

let indexPool = {
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
const shuffledImageIndexList = [];
const shuffledSourceList = [];

const MASTER_VOLUME = 0.2;

$backgroundMusic.volume = MASTER_VOLUME;
$pickSound.volume = MASTER_VOLUME;
$correctSound.volume = MASTER_VOLUME;
$gameFailSound.volume = MASTER_VOLUME;
$gameSuccessSound.volume = MASTER_VOLUME;

function resetForStart() {
  restAnswerCount = TOTAL_GOAL_POINT;
  $restAnswerCountText.textContent = `남은 뚱이 : ${restAnswerCount}`;
  correctPoint = 0;

  timeLimit = TIME_LIMIT_SECONDS;
  $gameTimer.textContent = `남은 시간 : ${timeLimit}`;
  timerId = null;

  indexPool = {
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

  shuffledImageIndexList.length = 0;
  shuffledSourceList.length = 0;


  $gameBoard.childNodes.forEach((element) => {
    element.src = DEFAULT_IMG_SOURCE;
    element.draggable = false;
  });

  const cellList = Array.from($gameBoard.children);
  cellList.forEach((element) => {
    if (!element.classList) return;

    element.classList.remove(CLASSNAME_NO_POINTER_EVENT);
  });
}

function startTimer() {
  timeLimit = TIME_LIMIT_SECONDS;

  timerId = setInterval(() => {
    $gameTimer.textContent = `남은 시간 : ${--timeLimit}`;

    if (timeLimit === 0) {
      clearInterval(timerId);
      showEnding(false);
    }
  }, 1000);
}

function shuffleImagesOrder() {
  for (let i = 0; i < 16; i++) {
    let generatedNumber = Math.floor(Math.random() * 16);

    while (!(generatedNumber in indexPool)) {
      let generatedNumberInsideWhile = Math.floor(Math.random() * 16);
      generatedNumber = generatedNumberInsideWhile;
    }

    shuffledImageIndexList.push(indexPool[generatedNumber]);
    delete indexPool[generatedNumber];
  }

  shuffledImageIndexList.forEach((number) => {
    const src = `./images/${imagePool[number]}.png`;
    shuffledSourceList.push(src);
  });
}

function handleGameStartButtonClick(event) {
  resetForStart();
  shuffleImagesOrder();

  startTimer();
  $backgroundMusic.play();

  event.currentTarget.classList.add(CLASSNAME_DISPLAY_NONE);
  $gameBoard.classList.remove(CLASSNAME_DISPLAY_NONE);
  $statusContainer.classList.remove(CLASSNAME_DISPLAY_NONE);
}

$gameStartContainer.addEventListener('click', handleGameStartButtonClick);

let clickCount = 0;
const pickedImgElementsList = [];

$gameBoard.addEventListener('click', handleCellClick);

function handleCellClick(event) {
  if (event.target === event.currentTarget) return;

  $pickSound.play();
  $pickSound.currentTime = 0;

  const $clicked = event.target;

  $clicked.src = shuffledSourceList[$clicked.dataset.index];
  $clicked.classList.add(CLASSNAME_NO_POINTER_EVENT);

  pickedImgElementsList.push($clicked)
  clickCount++;

  if (clickCount === 2) {
    checkTheAnswer(pickedImgElementsList);
  }
}

function checkTheAnswer(elementList) {
  if (!(elementList[0].src === elementList[1].src)) {
    backToDefaultImagesAndResetTools();

    elementList.forEach((element) => {
      element.classList.remove(CLASSNAME_NO_POINTER_EVENT);
    });
  } else if (elementList[0].src === elementList[1].src) {
    respondToAnswer();
    resetCheckingTools();
  }
}

function backToDefaultImagesAndResetTools() {
  setTimeout(function() {
    pickedImgElementsList.forEach((element) => {
      element.src = DEFAULT_IMG_SOURCE;
    });

    resetCheckingTools();
  }, 200);
}

function resetCheckingTools() {
  pickedImgElementsList.length = 0;
  clickCount = 0;
}

function respondToAnswer() {
  $correctSound.play();
  $correctSound.currentTime = 0;

  $restAnswerCountText.textContent = `남은 뚱이 : ${--restAnswerCount}`;

  correctPoint++;

  if (correctPoint === TOTAL_GOAL_POINT) {
    clearInterval(timerId);
    showEnding(true);
  }
}

function showEnding(isSuccess) {
  if (isSuccess) {
    $resultText.textContent = '뚱이 : 사랑해요~🎶';
    $resultImage.src = SUCCESS_IMG_SOURCE;
    $gameSuccessSound.play();
  } else {
    $resultText.textContent = `${restAnswerCount} 뚱이를 못찾았습니다😂`;
    $resultImage.src = FAIL_IMG_SOURCE;
    $gameFailSound.play();
  }

  $backgroundMusic.pause();
  $backgroundMusic.load();

  $gameBoard.classList.add(CLASSNAME_DISPLAY_NONE);
  $statusContainer.classList.add(CLASSNAME_DISPLAY_NONE);
  $resultContainer.classList.remove(CLASSNAME_DISPLAY_NONE);
}

$resultContainer.addEventListener('click', (event) => {
  resetForStart();
  shuffleImagesOrder();

  startTimer();
  $backgroundMusic.play();

  event.currentTarget.classList.add(CLASSNAME_DISPLAY_NONE);
  $gameBoard.classList.remove(CLASSNAME_DISPLAY_NONE);
  $statusContainer.classList.remove(CLASSNAME_DISPLAY_NONE);
});
