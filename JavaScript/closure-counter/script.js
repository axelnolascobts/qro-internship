// Creates the new counter
function createCounter() {
    let count = 0;

    return {
        increment() {
            count++;
        },
        reset() {
            count = 0;
        },
        getValue() {
            return count;
        }
    };
};

// DOM elements
const counterBtn = document.querySelector(".counterBtn");
const counterContainer = document.querySelector(".counterContainer");

// When user clicks button, create new counter.
counterBtn.addEventListener("click", () => {
    const counter = createCounter();

    // Make UI elements
    const counterBox = document.createElement("div");
    counterBox.classList.add("counterBox");

    const cvalue = document.createElement("p");
    cvalue.classList.add("counterValue");
    cvalue.textContent = "Value: 0";

    const incrementBtn = document.createElement("button");
    incrementBtn.classList.add("buttons");
    incrementBtn.textContent = "Increment";

    const resetBtn = document.createElement("button");
    resetBtn.classList.add("buttons");
    resetBtn.textContent = "Reset";

    // Button interactivity
    incrementBtn.addEventListener("click", () => {
        counter.increment();
        cvalue.textContent = "Value: " + counter.getValue();
    });

    resetBtn.addEventListener("click", () => {
        counter.reset();
        cvalue.textContent = "Value: " + counter.getValue();
    });

    // Add elements to the HTML
    counterBox.appendChild(cvalue);
    counterBox.appendChild(incrementBtn);
    counterBox.appendChild(resetBtn);

    counterContainer.appendChild(counterBox);
});
