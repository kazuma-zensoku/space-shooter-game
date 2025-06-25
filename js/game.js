const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let score = 0;
let gameOver = false;
let playerHP = 100;
let bossActive = false;
let bossHP = 500;
let bossesDefeated = 0;
let scoreSinceLastBoss = 0;