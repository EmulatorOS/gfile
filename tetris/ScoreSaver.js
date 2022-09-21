const NO_OF_HIGH_SCORES = 10;

  
  function checkHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0;
  
    if (score > lowestScore) {
      const name = prompt('You got a highscore! Enter name:');
      const newScore = { score, name };
      saveHighScore(newScore, highScores);
    }
  }
  
  function saveHighScore(score, highScores) {
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(NO_OF_HIGH_SCORES);
  
    localStorage.setItem('highScores', JSON.stringify(highScores));
  }