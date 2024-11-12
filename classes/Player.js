const X_VELOCITY = 150
const Y_VELOCITY = 150

class Player{
  
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.velocity = velocity
    //topleft of the player is het origin point, we willen de center dus topleft plus breedte delen door 2 is het middelpunt, zelfde voor y maar dan met hoogte
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

    this.loaded = false
    //we slaan een image op in this.image
    this.image = new Image()
    this.image.onload = () => {
      this.loaded = true
    }
    //als deze image groot is kan hij weleens niet ingeladen zijn voordat drawImage wordt aangeroepen beneden, daarvoor voegen we een check toe. this.loaded = 
    this.image.src = './images/player.png'

    //Player weapon
    this.weaponSpriteHasLoaded = false
    this.weaponSprite = new Image()
    this.weaponSprite.onload = () => {
      this.weaponSpriteHasLoaded = true
    }
    this.weaponSprite.src = './images/lance.png'

    this.currentFrame = 0
    this.elapsedTime = 0
    //De cropboxen van de verschillende sprites
    this.sprites ={
      walkDown: {
        x: 0, 
        y: 0, 
        width: 16, 
        height: 16,
        frameCount: 4,
      },
      walkUp: {
        x: 16, 
        y: 0, 
        width: 16, 
        height: 16,
        frameCount: 4,
      },
      walkLeft: {
        x: 32, 
        y: 0, 
        width: 16, 
        height: 16,
        frameCount: 4,
      },
      walkRight: {
        x: 48, 
        y: 0, 
        width: 16, 
        height: 16,
        frameCount: 4,
      },
      attackDown: {
        x: 0, 
        y: 64, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      attackUp: {
        x: 16, 
        y: 64, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      attackLeft: {
        x: 32, 
        y: 64, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      attackRight: {
        x: 48, 
        y: 64, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      hitDown: {
        x: 0, 
        y: 80, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      hitUp: {
        x: 16, 
        y: 80, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      hitLeft: {
        x: 32, 
        y: 80, 
        width: 16, 
        height: 15,
        frameCount: 1,
      },
      hitRight: {
        x: 48, 
        y: 80, 
        width: 16, 
        height: 15,
        frameCount: 1,
      }
    }
    //Welke sprite willen we nu laten zien
    this.currentSprite = this.sprites.walkDown
    this.facing = 'down'
    this.isAttacking = false
    this.attackTimer = 0
    
    this.attackBoxes ={
      right: {
        xOffset: 10,
        yOffset: 9,
        width: 25,
        height: 10,
      },
      left: {
        xOffset: -15,
        yOffset: 9,
        width: 25,
        height: 10,
      },
      up: {
        xOffset: 2,
        yOffset: -16,
        width: 10,
        height: 25,
      },
      down: {
        xOffset: 0,
        yOffset: 9,
        width: 10,
        height: 25,
      }
    }

    this.attackBox = {
      x: this.x + this.attackBoxes[this.facing].xOffset,
      y: this.y + this.attackBoxes[this.facing].yOffset,
      width: this.attackBoxes[this.facing].width,
      height: this.attackBoxes[this.facing].height,
    }
    //je kan maar 1 enemy tegelijk raken door deze op true te zetten zodra je iemand raakt, en in de hitboxcode staat dat als dit true is dan kan je niks anders raken, het reset weer als je naar idlestate gaat, zorgt er ook voor dat je niet 2 keer een enemy kan damagen in 1 aanval
    this.hasHitEnemy = false
    this.isInvincible = false
    this.elapsedInvicibilityTime = 0
    this.invincibilityInterval = 0.8
    this.playWeaponSound = false
    this.bounceBack = false
    this.elapsedBounceBackTime = 0
    this.bounceBackInterval = 0.1
    this.bounceFacing = 'mDown'
    this.isHit = false
    this.hitTimer = 0
    this.elapsedTalkTime = 0
  }

  NPCCollision(){
    switch(player.facing){
      case 'down' :
        this.y = this.y-3;
        this.bounceFacing = 'mUp'
      break
    case 'right' :
      this.x = this.x-3;
      this.bounceFacing = 'mLeft'
      break
    case 'up' :
      this.y = this.y+3;
      this.bounceFacing = 'mDown'
      break 
    case 'left' :
      this.x = this.x+3;
      this.bounceFacing = 'mRight'
      break
    }
  }

  receiveHit(GameOverState, GameStartState){
    if(GameOverState || GameStartState || GameWinState) return
    switch(this.facing) {
      case 'down' :
        this.currentSprite = this.sprites.hitDown
        break
      case 'right' :
        this.currentSprite = this.sprites.hitRight
        break
      case 'up' :
        this.currentSprite = this.sprites.hitUp
        break 
      case 'left' :
        this.currentSprite = this.sprites.hitLeft
        break
    }
    this.currentFrame = 0
    if (this.isInvincible) return
    bgMusic.playerHit()
    this.isInvincible = true
    this.bounceBack = true
    this.isHit = true
  }

  hitRecoil(){
    if(this.bounceBack == true){
      switch(player.facing){
        case 'down' :
          this.y = this.y-3;
          this.bounceFacing = 'mUp'
        break
      case 'right' :
        this.x = this.x-3;
        this.bounceFacing = 'mLeft'
        break
      case 'up' :
        this.y = this.y+3;
        this.bounceFacing = 'mDown'
        break 
      case 'left' :
        this.x = this.x+3;
        this.bounceFacing = 'mRight'
        break
      }
      
    }
  }

  //sprite displays correct sprite based on where you were attacking
  switchBackToIdleState(){
    switch(this.facing) {
      case 'down' :
        this.currentSprite = this.sprites.walkDown
        break
      case 'right' :
        this.currentSprite = this.sprites.walkRight
        break
      case 'up' :
        this.currentSprite = this.sprites.walkUp
        break 
      case 'left' :
        this.currentSprite = this.sprites.walkLeft
        break
    }
    
  }

  //sprite displays correct sprite based on where you're moving
  attack(){
    if(GameOverState || GameStartState || GameWinState) return
    switch(this.facing) {
      case 'down' :
        this.currentSprite = this.sprites.attackDown
        break
      case 'right' :
        this.currentSprite = this.sprites.attackRight
        break
      case 'up' :
        this.currentSprite = this.sprites.attackUp
        break 
      case 'left' :
        this.currentSprite = this.sprites.attackLeft
        break
    }
    this.currentFrame = 0
    bgMusic.playAttack()
    this.playWeaponSound = true
    this.isAttacking = true
  }

  draw(c) {
    if(GameOverState || GameStartState || GameWinState) return
    //if this.loaded = false return en doe nog niks
    if (!this.loaded || !this.weaponSpriteHasLoaded) return

    //Attack box debug code
    //c.fillStyle = 'rgba(0, 0, 255, 0.5)'
    /*c.fillRect (
      this.attackBox.x, 
      this.attackBox.y, 
      this.attackBox.width, 
      this.attackBox.height
    )*/

    //this.image = de image, cropbox in de argumenten 2-5 wordt bepaald waar de crop op de spritesheet zich bevindt, 6-9 bepaalt de positie en de lengte en breedte waar deze getekend worden(op de player positie canvas API gebruikt geen objects dus dit hieronder is wat confusing)
    let alpha = 1
    if(this.isInvincible) {
      alpha = 0.5
    }
    c.save()
    c.globalAlpha = alpha
    c.drawImage(
      this.image, 
      this.currentSprite.x, 
      //canvas heeft soms een afwijking van 0.5 in het tekenen van images, in de Hoogte zien we bij de walk animatie dat er een klein zwart lijntje ontstaat daardoor, door plus 0.5 te doen fixt dat
      this.currentSprite.y + this.currentSprite.height * this.currentFrame + 0.5, 
      this.currentSprite.width, 
      this.currentSprite.height, 
      this.x, 
      this.y, 
      this.width, 
      this.height
    )
    c.restore()
    
    //Draw weapon, only when we are attacking
    if(this.isAttacking == true){
    //Welke richting we opkijken, bepalen we beneden bij het lopen wasd knoppen, offset bepaald hoeveel de speer van positie veranderd aan de hand van welke richting we opkijken
    let angle = 0
    let xOffset = 3
    let yOffset = 20
    switch(this.facing) {
      case 'down' :
        angle = 0
        xOffset = 3
        yOffset = 21
        break
      case 'right' :
        angle = (Math.PI * 3) / 2
        xOffset = 22
        yOffset = 11
        break
      case 'up' :
        angle = Math.PI
        xOffset = 4 
        yOffset = -7
        break 
      case 'left' :
        angle = Math.PI / 2
        xOffset = -7
        yOffset = 12
        break
    }
    //we zetten save en restore hier omheen omdat we anders het hele canvas gaan draaiien
    c.save()
    c.globalAlpha = alpha
    //draaiien van het wapen, we moeten het canvas verplaatsen naar rechtsboven het wapen anders roteert hij raar .en dan het wapen nog een klein stukje opschuiven(dat gebeurt in render)
    c.translate(this.x + xOffset, this.y + yOffset)
    c.rotate(angle)
    //6, 16 zijn de waardes van de afbeelding zelf dus 6 voor breedte en 16 voor hoogte, -3,-8 houdt in lionksboven, omdat we met de translate issue zitten moet dat -3,-8 zijn zodat we hem mooi kunnen draaiien in de correcte richting
    c.drawImage( this.weaponSprite, -3, -8, 6, 16)
    c.restore()
  }
}

  update(deltaTime, collisionBlocks) {
    if(GameOverState || GameStartState || GameWinState) return
    if (!deltaTime) return

    if(WeCanTalk == true){
      this.elapsedTalkTime += deltaTime
      if(this.elapsedTalkTime >= 1){
        WeCanTalk = false
        this.elapsedTalkTime = 0
      }
    }

    if(this.isInvincible){
      this.elapsedInvicibilityTime += deltaTime

      if(this.elapsedInvicibilityTime > this.invincibilityInterval){
        this.isInvincible = false
        this.elapsedInvicibilityTime = 0
      }
    }

    if(this.bounceBack){
      this.elapsedBounceBackTime += deltaTime

      if(this.elapsedBounceBackTime > this.bounceBackInterval) {
        this.bounceBack = false
        this.elapsedBounceBackTime = 0
      }
    }

    //Update attackTimer
    const timeToCompleteAttack = 0.3
    if(this.isAttacking && this.attackTimer < timeToCompleteAttack){
      this.attackTimer += deltaTime
    } else if (this.isAttacking && this.attackTimer >= timeToCompleteAttack) {
      //switch back to idle state
      this.attackTimer = 0
      this.isAttacking = false
      this.switchBackToIdleState()
      this.hasHitEnemy = false
      this.playWeaponSound = false
    }
    //Update Hit Timer
    const timeToCompleteHit = 0.3
    if(this.isHit && this.hitTimer < timeToCompleteHit){
      this.hitTimer += deltaTime
    
    } else if (this.isHit && this.hitTimer >= timeToCompleteHit) {
      //switch back to idle state
      this.isHit = false
      this.hitTimer = 0
      this.switchBackToIdleState()
    }

    this.elapsedTime += deltaTime

    this.hitRecoil()

    // ik zet deze op 0.10 anders krijg je soms dat de animatie niet begint wanneer je gaat lopen, als de animatie te snel is moeten we maar een extra frame tekenen maar ik vindt de animatie prima zo
    const intervalToGoToNextFrame = 0.10
    //oscilate tussen 0 - 3 % 4 zegt dat hij moet loopen tussen frames 0, 1, 2, 3 en dan terug naar het begin, this.currentSprite.frameCount geeft per animatie het aantal frames aan waar deze door moet loopen, als bijvoorbeeld Up 6 frames is en down 2 Frames dan staat dat gelijk goed.
    if (this.elapsedTime > intervalToGoToNextFrame) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
      this.elapsedTime -= intervalToGoToNextFrame
    }
    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)



    //update center positie
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

    this.attackBox = {
      x: this.x + this.attackBoxes[this.facing].xOffset,
      y: this.y + this.attackBoxes[this.facing].yOffset,
      width: this.attackBoxes[this.facing].width,
      height: this.attackBoxes[this.facing].height,
    }
  }

  

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  handleInput(keys, GameOverState, GameStartState, GameWinState) {
    this.velocity.x = 0
    this.velocity.y = 0

    if(this.isAttacking || this.isHit || GameOverState || GameStartState || GameWinState) return


    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY
      //zet de sprite naar de juiste animatiecropbox die we boven hebben gedefinieerd
      this.currentSprite = this.sprites.walkRight
      //zet de framecount naar het aantal frames dat er in deze animatie zit
      this.currentSprite.frameCount = 4
      this.facing = 'right'
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY
      this.currentSprite = this.sprites.walkLeft
      this.currentSprite.frameCount = 4
      this.facing = 'left'
    } else if (keys.w.pressed) {
      this.velocity.y = -Y_VELOCITY
      this.currentSprite = this.sprites.walkUp
      this.currentSprite.frameCount = 4
      this.facing = 'up'
    } else if (keys.s.pressed) {
      this.velocity.y = Y_VELOCITY
      this.currentSprite = this.sprites.walkDown
      this.currentSprite.frameCount = 4
      this.facing = 'down'
    } else {
      //frameCount = 1 om alleen de eerste frame te laten zien als je niks indrukt
      this.currentSprite.frameCount = 1
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    if(GameOverState || GameStartState) return
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Als het monster naar links/rechts is geslagen en het tegen een collisionbox komt wordt de snelheid op 0 gezet, anders loopt en hij er tegenaan en gaat dan de andere kant op
        if(this.bounceBack){
          if (this.bounceFacing == 'mLeft') {
            this.x = collisionBlock.x + collisionBlock.width + buffer
            this.x = this.x+0
              break
          } else if (this.bounceFacing == 'mRight') {
            this.x = collisionBlock.x - this.width - buffer
            this.x = this.x+0
            break
          }
          } else {
            if (this.velocity.x < 0) {
              this.x = collisionBlock.x + collisionBlock.width + buffer
              this.velocity.x = -this.velocity.x
              break
          } else if (this.velocity.x > 0) {
            this.x = collisionBlock.x - this.width - buffer
            this.velocity.x = -this.velocity.x
            break
          }
      }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    if(GameOverState || GameStartState) return
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        if(this.bounceBack){
          if (this.bounceFacing == 'mUp') {
              this.y = collisionBlock.y + collisionBlock.height + buffer
              this.y = this.y+0
              break
          } else if (this.bounceFacing == 'mDown') {
            this.y = collisionBlock.y - this.height - buffer
            this.y = this.y+0
            break
          }
          } else {
            if (this.velocity.y < 0) {
              this.y = collisionBlock.y + collisionBlock.height + buffer
              this.velocity.y = -this.velocity.y
              break
          } else if (this.velocity.y > 0) {
            this.y = collisionBlock.y - this.height - buffer
            this.velocity.y = -this.velocity.y
            break
          }
  
          }
      }
    }
  }
}