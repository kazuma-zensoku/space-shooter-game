const MAX_HIGH_SCORES = 5;

function saveHighScore(score) {
    const highScores = getHighScores();
    const newScore = { score, date: new Date().toISOString() };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);

    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Check if the new score is in the top 5
    const newScoreIndex = highScores.findIndex(s => s.date === newScore.date && s.score === newScore.score);
    return newScoreIndex; // Returns index (0-4) if in top 5, -1 otherwise
}

function getHighScores() {
    const highScoresJSON = localStorage.getItem('highScores');
    if (!highScoresJSON) {
        return [];
    }
    try {
        return JSON.parse(highScoresJSON);
    } catch (e) {
        console.error("Error parsing high scores from localStorage", e);
        return [];
    }
}