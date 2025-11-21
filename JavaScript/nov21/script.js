class Persona {
  constructor() {
    this.healthPoints = 100;
    this.shieldPoints = 20;
    this.attackPoints = 0;
    this.isDead = false;
  }
  attack(target) {
    let damage = this.attackPoints;

    if (target.shieldPoints > 0) {
      if (target.shieldPoints >= damage) {
        target.shieldPoints -= damage;
        damage = 0;
      } else {
        damage -= target.shieldPoints;
        target.shieldPoints = 0;
      }
    }

    if (damage > 0) {
      target.healthPoints -= damage;
      if (target.healthPoints <= 0) {
        target.healthPoints = 0;
        target.isDead = true;
        return true;
      }
    }
    return false;
  }
  heal(points) {
    this.healthPoints += points;
    return this.healthPoints;
  }
  healUnit(points) {
    const unitName = this.constructor.name;

    if (unitName === "Ninja") {
      Ninja.arr.forEach(ninja => {
        ninja.healthPoints += points;
      });
    } else if (unitName === "Samurai") {
      Samurai.arr.forEach(samurai => {
        samurai.healthPoints += points;
      });
    }
  }
}

class Ninja extends Persona {
  static arr = [];

  constructor() {
    super();
    this.attackPoints = 20;
    this.weapon = "katana"
    Ninja.arr.push(this);
  }

  jutsu(target) {
    const originalAttack = this.attackPoints;
    this.attackPoints = originalAttack * 2;
    const attackResult = this.attack(target);
    this.attackPoints = originalAttack;
    return attackResult;
  }
}
class Samurai extends Persona {
  static arr = [];

  constructor() {
    super();
    this.attackPoints = 10;
    this.armor = "helmet"
    Samurai.arr.push(this);
  }

  breathing(target) {
    const originalAttack = this.attackPoints;
    this.attackPoints = originalAttack * 2.5;
    const attackResult = this.attack(target);
    this.attackPoints = originalAttack;
    return attackResult;
  }
}

const ninjaGaiden = new Ninja();
const ninjaNaruto = new Ninja();

const samTanjiro = new Samurai();
const samBatusai = new Samurai();

console.log('ninjaGaiden.heal(10):', ninjaGaiden.heal(10)); // 110
console.log('ninjaGaiden.healUnit(20):', ninjaGaiden.healUnit(20)); // undefined
console.log('ninjaGaiden.healthPoints:', ninjaGaiden.healthPoints); // 130
console.log('ninjaNaruto.healthPoints:', ninjaNaruto.healthPoints); // 120

console.log('samTanjiro.healthPoints:', samTanjiro.healthPoints); // 100
console.log('samBatusai.breathing(ninjaGaiden):', samBatusai.breathing(ninjaGaiden)); // false
console.log('ninjaGaiden.healthPoints:', ninjaGaiden.healthPoints); // 105
console.log('ninjaGaiden.isDead:', ninjaGaiden.isDead); // false
