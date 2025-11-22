//------------------------------------------------------------
// Arrays for keeping track of units
const allNinjas = [];
const allSamurais = [];

//------------------------------------------------------------
// Setup the Ninja and Samurai constructors.
class Persona {
    constructor() {
        this.healthPoints = 100;
        this.shieldPoints = 20;
        this.attackPoints = 0;
        this.isDead = false;
    };

    dealDmg(target, dmg) {
        if (target.isDead) {
            return true;
        };

        // Apply dmg to shield
        if (target.shieldPoints > 0) {
            let absorbed = 0;
            // If dmg<shield, reduce shield .
            if (dmg < target.shieldPoints) {
                absorbed = dmg;
                target.shieldPoints -= absorbed;
            }
            // If dmg>shield, break shield, place leftover in dmg.
            else {
                absorbed = target.shieldPoints;
                target.shieldPoints = 0;
                dmg -= absorbed;
            }
        }

        // Apply dmg to HP (if any leftover from above).
        if (dmg > 0) {
            target.healthPoints -= dmg;
        }

        // Check person is dead.
        if (target.healthPoints <= 0) {
            target.healthPoints = 0;
            target.isDead = true;
            return true;
        }
        else {
            return false;
        };
    };

    // Regular attack
    attack(target) {
        return this.dealDmg(target, this.attackPoints);
    };

    // Regular singular heal
    heal(healAmount) {
        if (!this.isDead) {
            this.healthPoints += healAmount;
        }
        return this.healthPoints;
    };
};

// Ninja subclass
class Ninja extends Persona {
    constructor() {
        super();
        this.attackPoints = 20;
        this.weapon = "";
        allNinjas.push(this);
    };

    // Ninja Attack * 2
    jutsu(target) {
        return this.dealDmg(target, this.attackPoints * 2);
    };

    // Heal all ninjas
    healUnit(healAmount) {
        allNinjas.forEach(eachNinja => {
            if (!eachNinja.isDead) {
                eachNinja.healthPoints += healAmount;
            };
        });
    };

    // Set the weapon
    set(gearName) {
        this.weapon = gearName;
    };

    // Get the weapon
    get() {
        if (this.weapon != "") {
            return this.weapon;
        }
        else {
            return "!!Set a Weapon!!";
        };
    };
};

// Samurai subclass
class Samurai extends Persona {
    constructor() {
        super();
        this.attackPoints = 10;
        this.armor = "";
        allSamurais.push(this);
    };

    // Samurai attack * 2.5
    breathing(target) {
        return this.dealDmg(target, this.attackPoints * 2.5);
    };

    // Heal all samurais
    healUnit(healAmount) {
        allSamurais.forEach(eachSamurai => {
            if (!eachSamurai.isDead) {
                eachSamurai.healthPoints += healAmount;
            };
        });
    };

    // Set the armor
    set(gearName) {
        this.armor = gearName;
    };

    // Get the armor
    get() {
        if (this.armor != "") {
            return this.armor;
        }
        else {
            return "!!Set some Armor!!";
        };
    };
};

//------------------------------------------------------------
// Start the Game
const ninjaGaiden = new Ninja();
const ninjaNaruto = new Ninja();

const samTanjiro = new Samurai();
const samBatusai = new Samurai();

console.log(`Heal Gaiden: ${ninjaGaiden.heal(10)}`); // 110
console.log(`Heal Ninjas: ${ninjaGaiden.healUnit(20)}`); // undefined
console.log(`HP of Gaiden: ${ninjaGaiden.healthPoints}`); // 130
console.log(`HP of Naruto: ${ninjaNaruto.healthPoints}
    `); // 120

console.log(`HP of Tanjiro: ${samTanjiro.healthPoints}`); // 100
console.log(`Did breathing kill Gaiden: ${samBatusai.breathing(ninjaGaiden)}`); // false
console.log(`HP of Gaiden: ${ninjaGaiden.healthPoints} `); // 125
console.log(`Is Gaiden dead?: ${ninjaGaiden.isDead} `); // false

samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
samBatusai.breathing(ninjaGaiden);
console.log(`Did breathing kill Naruto: ${samBatusai.breathing(ninjaNaruto)}`); // false
console.log(`Did breathing kill Gaiden: ${samBatusai.breathing(ninjaGaiden)}`); // true
console.log(`Is Gaiden dead?: ${ninjaGaiden.isDead} `); // true

samTanjiro.set("Shield");
console.log(`Tanjiro's armor: ${samTanjiro.get()} `); // Shield