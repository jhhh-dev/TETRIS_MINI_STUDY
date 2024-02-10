import BLOCKS from './blocks.js'; //import를 사용하려면 타입을 모듈로 해주어야 한다

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

// const BLOCKS = {
//     tree: [
//         [[2,1],[0,1],[1,0],[1,1]],
//         [[1,2],[0,1],[1,0],[1,1]],
//         [[1,2],[0,1],[2,1],[1,1]],
//         [[2,1],[1,2],[1,0],[1,1]],
//     ],
//     square: [

//     ]
// }

const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3,
};

init();

// functions
function init(){
    tempMovingItem = { ...movingItem}; //스프레드오퍼레이터 movingItem의 값만 가져오는것 변경된 것은 안가져옴
    // moviItem.left = 3;
    // console.log(tempMovingItem);
    for(let i = 0; i < GAME_ROWS; i++){
        prependNewLine();
    }

    generateNewBlock();
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

//블록을 렌더링해준 함수
function renderBlocks(moveType="") {
    //아이템을 바로 사용할 수 있도록 가져오게 하는 것 변수처럼 접근할 수 있도록
    const { type, direction, top, left } = tempMovingItem;
    //console.log(type, direction, top, left);

    //블럭 움직일 때 잔상 지우기
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
        //console.log(moving)
    });
    
    // console.log(BLOCKS[type][direction]);
    //모양 찍는 코드
    BLOCKS[type][direction].some(block => { //some을 foreach대신
        const x = block[0] + left;
        const y = block[1] + top;

        //선에서 벗어나지 못하게 빈값인지 확인하는
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        //console.log(target);
        //빈 여백 체크 블럭 체크
        const isAvailable = checkEmpty(target);//여백체크 seized 체크
        if(isAvailable){
            target.classList.add(type, "moving");
        } else{
            tempMovingItem = { ...movingItem} // 원상복구
            if(moveType === 'retry'){
                clearInterval(downInterval); //인터벌을 멈추고
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry'); // 재귀함수니까 외부로 빼놔서 이벤트가 다 실행된 다음 실행하게 암튼
                if(moveType == "top"){
                    seizeBlock();
                }
            }, 0)
            return true;
        }

    });

    //정상작동하면 무빙아이템을 업뎃해주는
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

//빈 여백 체크 블럭 체크
function seizeBlock(){ //아래 체크
    //무빙클래스를 가진 것들을 시즈블럭으로 바꾸기
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
        //console.log(moving)
    });
    checkMatch();
}

function checkMatch(){
    
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerHTML = score;
        }
    })

    generateNewBlock();
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top',1)
    }, duration);

    //오브젝트를 반복문을 돌려서 랜덤하게 가져오는
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    // console.log(blockArray[randomIndex][0]);
    // blockArray.forEach(block=>{
    //     console.log(block[0]);
    // });
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem};
    renderBlocks();
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top", 1)
    }, 10);
}

function showGameoverText(){
    gameText.style.display = "flex";
}

// event hadling - 키를 눌렀을 때 
document.addEventListener("keydown", e=>{
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;    
    }

    //console.log(e);
});

restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none";
    init();
})