class Monster {
  constructor({ x, y, size, velocity = { x: 0, y: 0 }, imageSrc, sprites, health = 3 }) {
    this.x = x
    this.y = y
    this.originalPosition = {
      x: x,
      y: y
    }
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
    //imageSrc maakt de sprite dynamisch, dus de monsters kunnen verschillende sprites hebben, deze moet dan wel in constructor worden aangeroepen
    this.image.src = imageSrc
    this.currentFrame = 0
    this.elapsedTime = 0
    this.elapsedMovementTime = 0
    this.elapsedMinimumTime = 0
    //De cropboxen van de verschillende sprites, stel de spritesheets zijn anders dan moeten onderstaande values ook dynamisch zijn zodat ze per spritesheet werken, daarvoor geven we in de constructor sprites door en bij monsters array in de index.js geven we de juiste properties aan de sprites
    this.sprites = sprites
    //Welke sprite willen we als eerste laten zien, Object veranderd objects met een hoop verschillende keys etc in een array. Dus wat we hier doen is van de sprites een array maken en dan de eerste selecteren met [0]
    this.currentSprite = Object.values(this.sprites)[0]
    this.health = health
    this.isInvincible = false
    this.elapsedInvicibilityTime = 0
    this.invincibilityInterval = 0.4
    this.bounceBack = false
    this.elapsedBounceBackTime = 0
    this.bounceBackInterval = 0.1
    this.monsterFacing = 'mDown'
  }

  receiveHit(){
    if (this.isInvincible) return
    
    this.health--
    this.isInvincible = true
    this.bounceBack = true
    bgMusic.playMonsterHit()
  }

  draw(c) {
    //if this.loaded = false return en doe nog niks
    if (!this.loaded) return

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
      this.currentSprite.height * this.currentFrame + 0.5, 
      this.currentSprite.width, 
      this.currentSprite.height, 
      this.x, 
      this.y, 
      this.width, 
      this.height
    )
    c.restore()
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    if(this.isInvincible){
      this.elapsedInvicibilityTime += deltaTime

      if(this.elapsedInvicibilityTime > this.invincibilityInterval){
        this.isInvincible = false
        this.elapsedInvicibilityTime = 0
        this.bounced = false
      }
    }

    if(this.bounceBack){
      this.elapsedBounceBackTime += deltaTime

      if(this.elapsedBounceBackTime > this.bounceBackInterval) {
        this.bounceBack = false
        this.elapsedBounceBackTime = 0
      }
    }

    this.elapsedTime += deltaTime

    // ik zet deze op 0.10 anders krijg je soms dat de animatie niet begint wanneer je gaat lopen, als de animatie te snel is moeten we maar een extra frame tekenen maar ik vindt de animatie prima zo
    const intervalToGoToNextFrame = 0.10
    //oscilate tussen 0 - 3 % 4 zegt dat hij moet loopen tussen frames 0, 1, 2, 3 en dan terug naar het begin, this.currentSprite.frameCount geeft per animatie het aantal frames aan waar deze door moet loopen, als bijvoorbeeld Up 6 frames is en down 2 Frames dan staat dat gelijk goed.
    if (this.elapsedTime > intervalToGoToNextFrame) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
      this.elapsedTime -= intervalToGoToNextFrame
    }

    this.hitRecoil()

    //Randomly choos place for enemy to move to timer
    this.setVelocity(deltaTime)

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
  }

  hitRecoil(){
    if(this.bounceBack == true){
      switch(player.facing){
        case 'down' :
          this.y = this.y+3;
          this.monsterFacing = 'mDown'
        break
      case 'right' :
        this.x = this.x+3;
        this.monsterFacing = 'mRight'
        break
      case 'up' :
        this.y = this.y-3;
        this.monsterFacing = 'mUp'
        break 
      case 'left' :
        this.x = this.x-3;
        this.monsterFacing = 'mLeft'
        break
      }
      
    }
  }

  // zou ook nice zijn als de 3 seconden random wordt gegenereerd tussen 2 en 4 bijvoorbeeld zodat ze niet altijd even lang lopen
  setVelocity(deltaTime) {
    var intervalToGoToNextMovementFrame = 3
    if(this.elapsedMinimumTime > 1 || this.elapsedMinimumTime === 0){
      intervalToGoToNextMovementFrame = Math.floor(Math.random() * (3) + 1 )
      this.elapsedMinimumTime -= 1
    }
    if(this.elapsedMovementTime > intervalToGoToNextMovementFrame || this.elapsedMovementTime === 0) {
      this.elapsedMovementTime -= intervalToGoToNextMovementFrame
      //we willen een hoek in een cirkel weten, we gebruiken radiants en niet degrees dus pi*2 geeft een cirkel in radiants Math.random() geeft een getal tussen 0 en 1
      const angle = Math.random() * Math.PI * 2
      const CIRCLE_RADIUS = 15

      const targetLocation ={
        x: this.originalPosition.x + Math.cos(angle) * CIRCLE_RADIUS,
        y: this.originalPosition.y + Math.sin(angle) * CIRCLE_RADIUS,
      }

      //change in distance
      const deltaX = targetLocation.x - this.x
      const deltaY = targetLocation.y - this.y

      //omdat deltaX en deltaY grote getallen kunnen zijn willen we ze normaliseren zodat ze niet op warpspeed gaan lopen, de lange zijde van de driehoek berekenen we hier (a2 + b2 = c2)
      const hypotenuse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const normalizeDeltaX = deltaX / hypotenuse
      const normalizeDeltaY = deltaY / hypotenuse

      //* 20 omdat je anders rond de 0 zit qua snelheid
      this.velocity.x = normalizeDeltaX * CIRCLE_RADIUS
      this.velocity.y = normalizeDeltaY * CIRCLE_RADIUS
    }
    this.elapsedMinimumTime += deltaTime
    this.elapsedMovementTime += deltaTime
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  checkForHorizontalCollisions(collisionBlocks) {
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
          if (this.monsterFacing == 'mLeft') {
            this.x = collisionBlock.x + collisionBlock.width + buffer
            this.x = this.x+0
              break
          } else if (this.monsterFacing == 'mRight') {
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
        // Als het monster naar boven/onder is geslagen en het tegen een collisionbox komt wordt de snelheid op 0 gezet, anders loopt en hij er tegenaan en gaat dan de andere kant op
        if(this.bounceBack){
        if (this.monsterFacing == 'mUp') {
            this.y = collisionBlock.y + collisionBlock.height + buffer
            this.y = this.y+0
            break
        } else if (this.monsterFacing == 'mDown') {
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