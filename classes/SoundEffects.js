const myMusic = new Audio("./SFX/GameTheme.mp3");
myMusic.volume = 0.2

class SoundFX {
    constructor({}){
        this.isBgPlaying = false
    }

startGame() {
    if(this.isBgPlaying == false){
        myMusic.play();
        this.isBgPlaying = true
    } else {
        myMusic.pause();
        this.isBgPlaying = false
    }
  }

playAttack() {
  if(!player.playWeaponSound){
    const AttackFX = new Audio("./SFX/Woosh_Short.mp3");
    //rng generator voor een getal tussen 0.6 en 0.3
    let audioVolume = (Math.random() * (0.6-0.3) + 0.3)
    AttackFX.volume = audioVolume
    //rng generator voor een getal tussen 2.5 en 1
    let audiospeed = (Math.random() * (2.5-1) + 1)
    AttackFX.playbackRate = audiospeed
    AttackFX.play();
    }
}

playMonsterHit(){
  const MonstaHit = new Audio("./SFX/Enemy-Hit2.mp3");
  let audioVolume = 0.2
  MonstaHit.volume = audioVolume
  let audiospeed = (Math.random() * (1.2-0.8) + 0.8)
  MonstaHit.playbackRate = audiospeed
  MonstaHit.play()
}

playerHit(){
  const playHit = new Audio("./SFX/Player_Hit.mp3");
  let audioVolume = 0.2
  playHit.volume = audioVolume
  let audiospeed = (Math.random() * (1.2-0.8) + 0.8)
  playHit.playbackRate = audiospeed
  playHit.play()
}

playerTalk(){
  const playTalk = new Audio("./SFX/Confirmation.mp3");
  let audioVolume = 0.2
  playTalk.volume = audioVolume
  playTalk.play()
}

}