window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      keys.w.pressed = true
      isTalking = false
      break
    case 'a':
      keys.a.pressed = true
      isTalking = false
      break
    case 's':
      keys.s.pressed = true
      isTalking = false
      break
    case 'd':
      keys.d.pressed = true
      isTalking = false
      break
    case ' ':
      event.preventDefault()
      player.attack()
      break
    case 'Enter':
      if(GameStartState == true){
        bgMusic.startGame()
        GameStartState = false
      }
      if (GameWinState == true){
        location.reload();
      }
      if(GameOverState == true){
        location.reload();
      }
      break
    case 'z':
      if(WeCanTalk == true && isTalking == false)
      {
        isTalking = true
        bgMusic.playerTalk()
      }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

// On return to game's tab, ensure delta time is reset
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTime = performance.now()
  }
})