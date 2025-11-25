const createBtn = document.getElementById("createBtn");
const counterContainer = document.getElementById("counter-container");

function createCounter() {
    let count = 0;
    return {
        increment: () => ++count,
        reset: () => count = 0,
        getValue: () => count
    };
}

function createContainer() {
    let counter = createCounter();
    const counterItem = document.createElement("div");

    const buttonContainer = document.createElement("div");
    const countDisplay = document.createElement("span");
    countDisplay.textContent = `Current value: ${counter.getValue()}`

    const incBtn = document.createElement("button");
    incBtn.textContent = "Increment";
    incBtn.addEventListener("click", () => {
        counter.increment();
        countDisplay.textContent = `Current value: ${counter.getValue()}`;
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset"
    resetBtn.addEventListener("click", () => {
        counter.reset();
        countDisplay.textContent = `Current value: ${counter.getValue()}`;
    });

    buttonContainer.appendChild(incBtn);
    buttonContainer.appendChild(resetBtn);

    counterItem.appendChild(buttonContainer);
    counterItem.appendChild(countDisplay);

    counterContainer.appendChild(counterItem);
}

createBtn.addEventListener("click", createContainer);