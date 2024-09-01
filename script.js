
class stateStore {
    static numberOfFloors = 0
    static numberOfLifts = 0
    // tracks floors lifts are going to
    static #scheduledFloors = new Set()
    // keeps the list of all the floors
    static #floors = []
    // keeps the list of all the lifts
    static #lifts = []


    // adds lift to list
    static addLift(lift) {
        this.#lifts.push(lift)
    }
    // gets the array of list
    static getLiftList() {
        return [...this.#lifts]
    }
    // clears the list of lifts
    static clearLift() {
        this.#lifts = []
    }
    // sets the list of lifts
    static setLift(liftSet) {
        this.#lifts = liftSet
    }
    // remove floor from scheduled floors once lift reach
    static removeFromScheduledFloors(value) {
        this.#scheduledFloors.delete(value)
    }
    // added new stops to a lift
    static updateLiftStops(index, distance, floor,direction) {
        // to check if a lift is already going to a particular floor
        if (this.#scheduledFloors.has(floor))
            return
        this.#lifts[index].direction = direction;
        this.#lifts[index].stops.push({ floor: floor, distance: distance })
        // managing the stops in a priority queue by sorting according to
        // relative distance of lift from floors
        this.#lifts[index].stops.sort((a, b) => a.distance - b.distance)
        this.#scheduledFloors.add(floor)
    }
    // opens and closes the door state
    static toggleDoor(index) {
        this.#lifts[index].door = !this.#lifts[index].door
    }


    // adds new floors to floor list
    static addFloor(floor) {
        this.#floors.push(floor)
    }
    // gets the list of floors
    static getFloorList() {
        return [...this.#floors]
    }
    // clears the list of floors
    static clearFloor() {
        this.#floors = []
    }
}



// This calculates the relative distance of a lift from a give floor
// Takes the follow parameters 
// currentFloor -> current floor lift is on
// calledFloor -> the floor we have to calculate relative distance to
// finalStop -> if lift is moving what is it's current final stop
// calledDirection -> what button has been pressed up or down
//                         6                 8           9            down
function calculateDistance(currentFloor, calledFloor, finalStop, calledDirection) {
    if (finalStop === undefined) {
        return Math.abs(calledFloor - currentFloor)
    }
    if (finalStop > currentFloor ) {
        if (currentFloor > calledFloor)
            return (finalStop - currentFloor) + (finalStop - calledFloor)
        else if (calledDirection === 'down' && calledFloor > currentFloor && calledFloor < finalStop)
            return (finalStop - currentFloor) + (finalStop - calledFloor)
        return calledFloor - currentFloor
    }
    if (currentFloor < calledFloor)
        return (currentFloor - finalStop) + (calledFloor - currentFloor)
    else if (calledDirection === 'up' && calledFloor < currentFloor && calledFloor > finalStop)
        return (currentFloor - finalStop) + (currentFloor - finalStop)
    return currentFloor - calledFloor
}

// This function handles task assignment that is which lift 
// will go to which floor
function assignTask(floor, calledDirection) {
    let closestDistnce = Number.MAX_SAFE_INTEGER
    let assignTo
    stateStore.getLiftList().forEach((lift, index) => {
        let distance = calculateDistance(lift.currentPosition, floor.floorNumber, lift.stops.length === 0 ? undefined : lift.stops[lift.stops.length - 1].floor, calledDirection)
        console.log(distance,`${lift.htmlID} currentFloor=${lift.currentPosition}, calledFloor=${floor.floorNumber}, finalStop=${lift.stops.length === 0 ? undefined : lift.stops[lift.stops.length - 1].floor}, calledDirection=${calledDirection}`);
        if (distance < closestDistnce) {
            closestDistnce = distance
            assignTo = { lift: lift, distance: distance, index: index }
        }
    })
    stateStore.updateLiftStops(assignTo.index, assignTo.distance, floor.floorNumber,calledDirection)
}

// This function creates the floors at UI level
function createFloor() {
    const floorList = stateStore.getFloorList()
   const floorDivs = floorList.map((floor, index) => {
        let div
        if (index === 0) {
            div = generateFloorElement(floor, true, false, index)
            div.childNodes[1].childNodes[0].onclick = () => { assignTask(floor, 'up') }
        }
        else if (index === stateStore.numberOfFloors - 1) {
            div = generateFloorElement(floor, false, true, index)
            div.childNodes[1].childNodes[0].onclick = () => { assignTask(floor, 'down') }
        }
        else {
            div = generateFloorElement(floor, true, true, index)
            div.childNodes[1].childNodes[0].onclick = () => { assignTask(floor, 'up') }
            div.childNodes[1].childNodes[1].onclick = () => { assignTask(floor, 'down') }
        }
        return div;
    })
  floorDivs.reverse().forEach(div=>document.getElementById("building").appendChild(div)
  ) 
}

// This function creates the lifts at UI level
function createLift() {
    const liftList = stateStore.getLiftList()
    liftList.map((lift, index) => {
        const div = generateLiftElement(lift, index)
        document.getElementById(`lift-container${lift.currentPosition}`).appendChild(div);
    })
}




// generates up-down buttons
function generateButtonElement(floor, up, down) {
    const div = document.createElement("div")
    div.id = `b${floor.floorNumber}`
    div.classList.add('btn-group')
    if (up) {
        const upButton = document.createElement("button")
        upButton.innerText = `UP`
        upButton.classList.add('btn')
        upButton.classList.add('up-btn')
        div.appendChild(upButton)
    }
    if (down) {
        const downButton = document.createElement("button")
        downButton.innerHTML = `DOWN`
        downButton.classList.add('btn')
        downButton.classList.add('down-btn')
        div.appendChild(downButton)
    }
    return div
}


// generates floor component
function generateFloorElement(floor, up, down, index) {
    const div = document.createElement("div")
    const buttonDiv = generateButtonElement(floor, up, down)
    const para = document.createElement("p")
    const liftContainer = document.createElement('div')
    para.innerText = `Floor ${floor.floorNumber + 1}`
    div.id = floor.htmlID
    liftContainer.classList.add('lift-container')
    liftContainer.id = `lift-container${index}`
    div.classList.add('floor')
    div.appendChild(para)
    div.appendChild(buttonDiv)
    div.appendChild(liftContainer)
    return div
}


// generates lift component
function generateLiftElement(lift, index) {
    const div = document.createElement("div")
    div.style = `position: absolute; left: ${50 * index}px`

    div.id = lift.htmlID
    div.classList.add("lift")
    const leftDoor = document.createElement('div');
    leftDoor.classList.add('door', 'left-door');
    leftDoor.style.width = '20px'; 

    const rightDoor = document.createElement('div');
            rightDoor.classList.add('door', 'right-door');
            rightDoor.style.width = '20px';

        div.appendChild(leftDoor);
        div.appendChild(rightDoor);
    return div
}




// initializes the floors and lifts for data models
function handleCreate(lifts, floors) {
    stateStore.clearLift()
    stateStore.clearFloor()
    const children = [...document.getElementById('building').childNodes]
    children.forEach((item) => {
        item.remove()
    })
    stateStore.numberOfFloors = floors
    stateStore.numberOfLifts = lifts
    for (let i = 0; i < lifts; i++) {
        var lift = new Lift(i)
        stateStore.addLift(lift)
    }
    for (let i = 0; i < floors; i++) {
        var floor = new Floor(i)
        stateStore.addFloor(floor)
    }
}


function closeDoor(lift,index){
    let liftDiv = document.getElementById(lift.htmlID);
    const leftDoor = liftDiv.querySelector('.left-door');
    const rightDoor = liftDiv.querySelector('.right-door');
    leftDoor.style.webkitTransform = `translateX(0)`;
    leftDoor.style.transform = `translateX(0)`;
    rightDoor.style.webkitTransform = `translateX(0)`;
    rightDoor.style.transform = `translateX(0)`;

    stateStore.toggleDoor(index)
}

function openDoor(lift,index){
    let liftDiv = document.getElementById(lift.htmlID);
    const leftDoor = liftDiv.querySelector('.left-door');
    const rightDoor = liftDiv.querySelector('.right-door');

    // Trigger door open animation
    leftDoor.style.webkitTransform = `translateX(-100%)`;
    leftDoor.style.transform = `translateX(-100%)`;
    rightDoor.style.webkitTransform = `translateX(100%)`;
    rightDoor.style.transform = `translateX(100%)`;
    stateStore.toggleDoor(index)
}

// This function handles re-rendering and creates lift motion by translateY
function handleRerender() {
    const updatedStore = stateStore.getLiftList().map((lift, index) => {
        // check if door of a lift has to opened
        // console.log(JSON.stringify(lift));
        
        if (lift.door) {
            // close door
            closeDoor(lift,index)
        }
        // check if a lift is running
        else if (lift.direction !== 'none') {
            // check if lift has reached the destination
            if (lift.stops[0].floor === lift.currentPosition) {
                // open door
                openDoor(lift,index)
                stateStore.removeFromScheduledFloors(lift.currentPosition)
                lift.stops.shift()
                if (lift.stops.length === 0)
                    lift.direction = 'none'
            }
            // if not reached then move towards destination
            else {
                if (lift.stops[0].floor - lift.currentPosition > 0) {
                    // move up
                    
                    lift.currentPosition = (lift.currentPosition + 1) % stateStore.numberOfFloors
                    document.getElementById(lift.htmlID).style.transform = `translateY(${(-100) * lift.currentPosition}px)`
                    document.getElementById(lift.htmlID).style.transition = 'transform 2000ms'
                    document.getElementById(lift.htmlID).style.transitionTimingFunction = 'linear'
                    lift.stops[0].distance = lift.stops[0].distance - 1
                }
                else {
                    // move down
                    lift.currentPosition = (lift.currentPosition - 1) >= 0 ? lift.currentPosition - 1 : lift.currentPosition - 1
                    document.getElementById(lift.htmlID).style.transform = `translateY(${-100 * (lift.currentPosition)}px)`
                    document.getElementById(lift.htmlID).style.transition = 'transform 2000ms'
                    document.getElementById(lift.htmlID).style.transitionTimingFunction = 'linear'
                    lift.stops[0].distance = lift.stops[0].distance - 1
                }
            }
        }
        return lift
    })

    // update lifts state
    stateStore.setLift(updatedStore)
}


// This is the Lift class, for creating data level abstration
class Lift {
    constructor(id, stops = [], currentPosition = 0, direction = 'none') {
        this.id = id
        this.htmlID = `lift${id}`
        this.stops = stops
        this.currentPosition = currentPosition
        this.door = false
        this.direction = direction
    }

    static addStop(stop) {
        this.stops.push(stop)
    }

    static reachedStop() {
        this.stops.shift()
    }
}

// This is floor class for creating data level abstration
class Floor {
    constructor(floorNumber) {
        this.floorNumber = floorNumber
        this.htmlID = `floor${floorNumber}`
    }
}





// This adds functionality to the create button
document.getElementById("create").addEventListener("click", (e) => {
    e.preventDefault()
    var lift = document.getElementById("lifts").value
    var floor = document.getElementById("floors").value
    handleCreate(lift, floor)
    createFloor()
    createLift()
});

// This is the main runner function which runs handleRerender
// in every 2s
setInterval(async () => { handleRerender() }, 2000)
