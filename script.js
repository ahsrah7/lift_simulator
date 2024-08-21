const upBtn = (i)=>`<button class="btn btn-up" onclick="moveLift(${i},1)"> up </button>`;
const downBtn =(i)=>`<button class="btn btn-up" onclick="moveLift(${i},-1)"> down </button>`;
const datastore = {
   queue :[],
    
};


function getAvailableLift(toFloor,direction) {
    
    
    // get the stationary lifts
    let stationaryLifts = datastore.lifts.filter(lift => lift.state == datastore.STATUS[1]);
     let minDist =  Number.MAX_VALUE;
    let currlift = null;
    
    if (stationaryLifts.length > 0) {
    stationaryLifts.forEach(lift=>{
                let dist = Math.abs(lift.currentFloor - toFloor);
                if(dist < minDist){
                    minDist = dist;
                    currlift = lift;
                }
        });
        return currlift;
    }else{
        datastore.queue = [...datastore.queue,{toFloor,direction}];
        return;
    }

    
}

function moveLift(floor,directionClicked,t="") {
    let floorState = datastore.floorButtonStates.find(floorState => floorState.id == floor);
    // console.log(floor,directionClicked,t,floorState)
    if(parseInt(directionClicked) == 1 && !floorState.isUpBtnPressed){
        floorState.isUpBtnPressed = true;
    }else if(parseInt(directionClicked) == -1 && !floorState.isDownBtnPressed){
        floorState.isDownBtnPressed = true;
    }else{
        return;
    }
    
    const btnPressedOnFloor = parseInt(floor);
    let availableLift = getAvailableLift(btnPressedOnFloor,directionClicked);
    
    if(!availableLift){
        return;
    }

    let destinationFloor = floor;
    if(availableLift.currentFloor != destinationFloor){
        let distanceToMove = (destinationFloor - 1) * document.getElementById("floor-1").offsetHeight;

        let lift = document.getElementById("lift-" + availableLift.id);
            lift.style.transform = `translateY(-${distanceToMove}px)`;
            lift.style.transition = `transform ${2000*Math.abs(destinationFloor - availableLift.currentFloor ) }ms linear`;
    }
        datastore.lifts[availableLift.id - 1].state = datastore.STATUS[0];
     
   
    setTimeout(function(){
         
           availableLift.currentFloor = destinationFloor;
        availableLift.direction = parseInt(directionClicked);
        
           openLiftDoors(availableLift);

       },(Math.abs(destinationFloor - availableLift.currentFloor ))*2*1000)
    
}

function openLiftDoors(lift) {
    let liftDiv = document.getElementById("lift-" + lift.id);
    const leftDoor = liftDiv.querySelector('.left-door');
    const rightDoor = liftDiv.querySelector('.right-door');

    // Trigger door open animation
    leftDoor.style.transform = `translateX(-100%)`;
    rightDoor.style.transform = `translateX(100%)`;

    setTimeout(() => {
        closeLiftDoors(lift);
    }, 2500); 
}

function closeLiftDoors(lift) {
     let liftDiv = document.getElementById("lift-" + lift.id);
    const leftDoor = liftDiv.querySelector('.left-door');
    const rightDoor = liftDiv.querySelector('.right-door');

    leftDoor.style.transform = `translateX(0)`;
    rightDoor.style.transform = `translateX(0)`;

    setTimeout(() => {
        
        datastore.lifts[lift.id - 1].state = datastore.STATUS[1];
        let floorState = datastore.floorButtonStates.find(floorState => floorState.id == lift.currentFloor);
        // console.log(floorState,"-----------beforee")
        if(parseInt(lift.direction) == 1)
            floorState.isUpBtnPressed = false;
        if(parseInt(lift.direction) == -1)
            floorState.isDownBtnPressed = false;
        // console.log(floorState,"-----------after",datastore.queue)
        checkAndProcessQueue();
    }, 2500); 
}

function checkAndProcessQueue() {
    for(let i=0;i<datastore.queue.length;i++)
        if (datastore.queue.length > 0) {
            
            const next = datastore.queue.shift(); 
            let floorState = datastore.floorButtonStates.find(floorState => floorState.id == next.toFloor);
            floorState.isUpBtnPressed = false;
             floorState.isDownBtnPressed = false;
                moveLift(next.toFloor,next.direction,"queue"); 
            
        }
}
function handleSubmit(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    datastore.lifts = [];
    datastore.floorButtonStates = [];
     datastore.STATUS = ["moving", "stationary"];
        datastore.DIRECTION = {
            up:1,
            down:-1
        }
     const building =  document.getElementById("building");
    // Get the form element
    const form = event.target;

    // Create an object to store the form data
    const formData = {};

    // Iterate over the form elements
    for (let element of form.elements) {
        if (element.name && element.type !== "submit") {
            formData[element.name] = element.value;
        }
    }

    if(formData.lifts && formData.floors && formData.lifts > 0 && formData.floors > 1){
         building.innerHTML = '';
        addFloor(formData.floors);
        addLift(formData.lifts);
    }else{
        if(!(formData.lifts > 0) && !(formData.floors > 0)){
            alert("Please enter valid inputs.");    
        return
        }
        
        if(!(formData.lifts > 0)){
            alert("Number of lifts should be greater than 0");    
        return
        }
        if(!(formData.floors > 1)){    
        alert("Number of floors should be greater than 1");
        return
        }
    }
   
}


function addFloor(floor) {
    const building = document.getElementById("building");
    for (let i = floor; i > 0; i--) {
        // Create a new div element
        const newDiv = document.createElement("div");

        // Set attributes for the new div
        newDiv.setAttribute("id", "floor-" + i);
        newDiv.setAttribute("class", "floor");

        const btnGroupDiv = document.createElement("div");

        // Set attributes for the new div
        btnGroupDiv.setAttribute("class", "btn-group");

        newDiv.appendChild(btnGroupDiv)
        if (i == 1){
            btnGroupDiv.innerHTML = downBtn(i) +`<div>Floor ${i}</div><div></div>`;
            datastore.floorButtonStates.push({
                    id : i,
                    isUpBtnPressed : false,
            })
        }
        else if (i == floor){
            btnGroupDiv.innerHTML = upBtn(i)+`<div>Floor ${i}</div><div></div>`;
            datastore.floorButtonStates.push({
                    id : i,
                    isDownBtnPressed : false,
            })
        }
        else {
            btnGroupDiv.innerHTML = upBtn(i) +`<div>Floor ${i}</div>`+ downBtn(i);
            datastore.floorButtonStates.push({
                id : i,
                isUpBtnPressed : false,
                isDownBtnPressed : false
            })
        }

        building.appendChild(newDiv);
        
    }

}

function addLift(lift) {
    const floor = document.getElementById("floor-1");
    // floor.style.position = "relative";
    const newLiftContainer = document.createElement("div");
    newLiftContainer.style.display = "flex";
    newLiftContainer.style.justifyContent = "space-evenly";
    newLiftContainer.style.alignItems = "flex-end";
    for (let i = 1; i <= lift; i++) {
        // Create a new div element
        const newLift = document.createElement("div");
        // Set attributes for the new div
        newLift.setAttribute("id", "lift-" + i);
        newLift.setAttribute("class", "lift");
        newLift.style.position = 'relative';
        const leftDoor = document.createElement('div');
        leftDoor.classList.add('door', 'left-door');
        leftDoor.style.width = '20px'; 

        const rightDoor = document.createElement('div');
                rightDoor.classList.add('door', 'right-door');
                rightDoor.style.width = '20px';

            newLift.appendChild(leftDoor);
            newLift.appendChild(rightDoor);
        newLiftContainer.appendChild(newLift);
        datastore.lifts.push({
            id: i,
            currentFloor: 1,
            direction: datastore.DIRECTION.up,
            state: datastore.STATUS[1],
        });
      
    }
    floor.appendChild(newLiftContainer)
}


