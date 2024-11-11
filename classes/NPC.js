class NPC {
    constructor({ x, y, size, velocity = { x: 0, y: 0 }, imageSrcNPC, NPCsprites, FirstDirectionNPC, SecondDirectionNPC, ThirdDirectionNPC, FourthDirectionNPC, MovementLeftTimer, MovementRightTimer, MovementUpTimer, MovementDownTimer, FirstTimerNPCMovement, SecondTimerNPCMovement, ThirdTimerNPCMovement, FourthTimerNPCMovement, FifthTimerNPCMovement, TalkBubble}) {
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
      this.image.src = imageSrcNPC
      this.currentFrame = 0
      //De cropboxen van de verschillende sprites, stel de spritesheets zijn anders dan moeten onderstaande values ook dynamisch zijn zodat ze per spritesheet werken, daarvoor geven we in de constructor sprites door en bij monsters array in de index.js geven we de juiste properties aan de sprites
      this.sprites = NPCsprites
      //Welke sprite willen we als eerste laten zien, Object veranderd objects met een hoop verschillende keys etc in een array. Dus wat we hier doen is van de sprites een array maken en dan de eerste selecteren met [0]
      this.currentSprite = Object.values(this.sprites)[0]
      this.elapsedMovementTime = 0
      this.NPCWalk = true
      this.facing = 'idle'
      this.currentFrame = 0
      this.elapsedTime = 0
      this.NPCisWalking = false
      this.NPCMovementLeft = MovementLeftTimer
      this.NPCMovementRight = MovementRightTimer
      this.NPCMovementUp = MovementUpTimer
      this.NPCMovementDown = MovementDownTimer
      this.NPCFirstTimer = FirstTimerNPCMovement
      this.NPCSecondTimer = SecondTimerNPCMovement
      this.NPCThirdTimer = ThirdTimerNPCMovement
      this.NPCFourthTimer = FourthTimerNPCMovement
      this.NPCFifthTimer = FifthTimerNPCMovement
      this.movementFace = FirstDirectionNPC
      this.FirstDirection = FirstDirectionNPC
      this.SecondDirection = SecondDirectionNPC
      this.ThirdDirection = ThirdDirectionNPC
      this.FourthDirection = FourthDirectionNPC
      this.TalkBubble = TalkBubble
    }

  
    draw(c) {
      //if this.loaded = false return en doe nog niks
      if (!this.loaded) return
  
      c.save()
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
  
    update(deltaTime) {
      if (!deltaTime) return
      if(isTalking) return

      this.setPath(deltaTime)
      this.switchBackToWalkState()
  
      this.elapsedTime += deltaTime
      // ik zet deze op 0.10 anders krijg je soms dat de animatie niet begint wanneer je gaat lopen, als de animatie te snel is moeten we maar een extra frame tekenen maar ik vindt de animatie prima zo
      const intervalToGoToNextFrame = 0.10
      //oscilate tussen 0 - 3 % 4 zegt dat hij moet loopen tussen frames 0, 1, 2, 3 en dan terug naar het begin, this.currentSprite.frameCount geeft per animatie het aantal frames aan waar deze door moet loopen, als bijvoorbeeld Up 6 frames is en down 2 Frames dan staat dat gelijk goed.
      if(this.NPCisWalking = true){
      if (this.elapsedTime > intervalToGoToNextFrame) {
        this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
        this.elapsedTime -= intervalToGoToNextFrame
      }
    } else {
      this.currentFrame = 0
    }
  
      //update center positie
      this.center = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
      }
    }

  
    //NPC's Lopen op een pre determined pad, stoppen wanneer je met ze interact
    setPath(deltaTime, isTalking) {

      

      if (this.NPCWalk == true) {
        this.elapsedMovementTime += deltaTime
      }
      
      switch(this.movementFace){
        case 'right':
          this.movementRight = true
          this.movementLeft = false
          this.movementUp = false
          this.movementDown = false
          this.facing = 'right'
          this.NPCisWalking = true
          break
        
        case 'left':
          this.movementRight = false
          this.movementLeft = true
          this.movementUp = false
          this.movementDown = false
          this.facing = 'left'
          this.NPCisWalking = true
          break
        
        case 'up':
          this.movementRight = false
          this.movementLeft = false
          this.movementUp = true
          this.movementDown = false
          this.facing = 'up'
          this.NPCisWalking = true
          break
        
        case 'down':
          this.movementRight = false
          this.movementLeft = false
          this.movementUp = false
          this.movementDown = true
          this.facing = 'down'
          this.NPCisWalking = true
          break

        case 'idle':
          this.movementRight = false
          this.movementLeft = false
          this.movementUp = false
          this.movementDown = false
          this.facing = 'idle'
          this.NPCisWalking = false
          break 
        }
      
      if(this.elapsedMovementTime >= this.NPCFirstTimer) {
        this.movementFace = this.FirstDirection
      }

      if(this.elapsedMovementTime >= this.NPCSecondTimer){
        this.movementFace = this.SecondDirection
      }

      if(this.elapsedMovementTime >= this.NPCThirdTimer){
        this.movementFace = this.ThirdDirection
      }

      if(this.elapsedMovementTime >= this.NPCFourthTimer){
        this.movementFace = this.FourthDirection
      }

      if(this.elapsedMovementTime >= this.NPCFifthTimer){
        this.elapsedMovementTime = 0
        this.x = this.originalPosition.x
        this.y = this.originalPosition.y
      }

      if(this.movementRight == true){
        this.x = this.x + this.NPCMovementRight
      }

      if(this.movementLeft == true){
        this.x = this.x - this.NPCMovementLeft
      }

      if(this.movementUp == true){
        this.y = this.y - this.NPCMovementUp
      }

      if(this.movementDown == true){
        this.y = this.y + this.NPCMovementDown
      }
    }

    switchBackToWalkState(){
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
        case 'idle' :
          this.currentSprite = this.sprites.idle
          break
      }
    }

}