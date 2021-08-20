const $gameStartContainer = document.querySelector('.game-start');
const $gameStartButton = document.querySelector('.game-start__button');

const $gameBoard = document.querySelector('.game-board');
const imgBoxElementList = document.querySelectorAll('.game-board__img-box');
const frontImageElementList = document.querySelectorAll('.front-img');
const backImageElementList = document.querySelectorAll('.back-img');

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
const CLASSNAME_HIDDEN = 'hidden';

const DEFAULT_IMG_SOURCE = './images/default.png';
const FAIL_IMG_SOURCE = './images/default.png';
const SUCCESS_IMG_SOURCE = './images/success.png';

const TOTAL_GOAL_POINT = 8;
let restAnswerCount = null;
let correctPoint = null;

const TIME_LIMIT_SECONDS = 30;
let timeLimit = null;
let timerId = null;

const imageNamePool = [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8 ];
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

const shuffledImageIndexList = [];
const shuffledSourceList = [];

const clickedFrontList = [];
const openedBackList = [];
let clickCount = 0;

const VOLUME = 0.2;

$backgroundMusic.volume
= $pickSound.volume
= $correctSound.volume
= $gameFailSound.volume
= $gameSuccessSound.volume = VOLUME;


$gameStartButton.addEventListener('click', handleGameStartButtonClick);

function handleGameStartButtonClick(event) {
  resetForStart();
  shuffleImagesOrder();

  startTimer();
  $backgroundMusic.play();

  $gameStartContainer.classList.add(CLASSNAME_DISPLAY_NONE);
  $gameBoard.classList.remove(CLASSNAME_DISPLAY_NONE);
  $statusContainer.classList.remove(CLASSNAME_DISPLAY_NONE);
}

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

  frontImageElementList.forEach((element) => {
    element.src = DEFAULT_IMG_SOURCE;
    element.classList.remove(CLASSNAME_HIDDEN);
    element.draggable = false;
  });

  imgBoxElementList.forEach((element) => {
    element.classList.remove(CLASSNAME_NO_POINTER_EVENT);
    element.draggable = false;
  });
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
    const src = `./images/${imageNamePool[number]}.png`;

    shuffledSourceList.push(src);
  });

  backImageElementList.forEach((element) => {
    element.src = shuffledSourceList[element.dataset.index];
    element.draggable = false;
  })
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

$gameBoard.addEventListener('click', handleCellClick);

function handleCellClick(event) {
  if (event.target === event.currentTarget) return;

  $pickSound.play();
  $pickSound.currentTime = 0;

  const $clicked = event.target;

  $clicked.classList.add(CLASSNAME_HIDDEN);
  $clicked.parentElement.classList.add(CLASSNAME_NO_POINTER_EVENT);

  clickedFrontList.push($clicked);
  openedBackList.push($clicked.nextElementSibling);
  clickCount++;

  if (clickCount === 2) {
    checkTheAnswer(openedBackList, clickedFrontList);
  }
}

function checkTheAnswer(openedImages, clickedFrontList) {
  if (!(openedImages[0].src === openedImages[1].src)) {
    respondToWrongAnswer(clickedFrontList);
  } else if (openedImages[0].src === openedImages[1].src) {
    respondToAnswer();
    resetCheckingTools();
  }
}

function respondToWrongAnswer(clickedFrontList) {
  setTimeout(function() {
    clickedFrontList.forEach((element) => {
      element.classList.remove(CLASSNAME_HIDDEN);
    });

    openedBackList.forEach((element) => {
      element.parentElement.classList.remove(CLASSNAME_NO_POINTER_EVENT);
    });

    resetCheckingTools();
  }, 200);
}

function resetCheckingTools() {
  openedBackList.length = 0;
  clickedFrontList.length = 0;
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

function showEnding(boolean) {
  if (boolean) {
    $resultText.textContent = '뚱이 : "사랑해요~🎶"';
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

$restartButton.addEventListener('click', handleRestartButtonClick);

function handleRestartButtonClick() {
  resetForStart();
  shuffleImagesOrder();

  startTimer();
  $backgroundMusic.play();

  $resultContainer.classList.add(CLASSNAME_DISPLAY_NONE);
  $gameBoard.classList.remove(CLASSNAME_DISPLAY_NONE);
  $statusContainer.classList.remove(CLASSNAME_DISPLAY_NONE);
}
