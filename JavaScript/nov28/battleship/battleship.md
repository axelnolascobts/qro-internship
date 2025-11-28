# Battleship

>Function definition in `battleship.js`

>TDD in `battleship.test.js`

Type your name in comments at the top of the file.

Shasbro is working on an online version of battleship table game, but they need a validator to know if the player has correctly placed his boats.

## The Board
* It is a 11 X 9 matrix
* 11 is the width and it is referenced by letters `[A-K]`
* 9 is the height and it si referenced by numbers `[1-9]`

## Available Boats
* Carrier, with five holes
* Battleship, with four holes
* Cruiser, with three holes
* Submarine, with three holes
* Destroyer, with two holes

## Placement Rules
* Boats can only be place vertically or horizontally, not diagonally in the grid
* All boats must be placed
* Boats cannot be placed immediately next to each other, they must be at least one space away

## Technical Data
* Write a function called `isBoardReady`
* The function receives 1 parameter
  * `boats` as a bidimentional array
    * Each boat is represented by an array of 2 coordinates, ex `['F9', '3A']`
      * The coordinates represent the limits of the ship
      * It can start with a letter or a number but it must have both
      * Letter are given always in uppercase
* The function will return a boolean indicating if all the boats have been correctly placed or not


## TDD

Add at least 2 useful test cases.