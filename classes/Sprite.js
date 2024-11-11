class Sprite {
    constructor({ x, y, imageSrc = './images/leafNew.png', velocity }) {
      this.x = x
      this.y = y
      this.width = 12
      this.height = 7
      this.center = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
      }
  
      this.loaded = false
      this.image = new Image()
      this.image.onload = () => {
        this.loaded = true
      }
      this.image.src = imageSrc
      this.currentFrame = 2

      this.currentSprite = {
          x: 0, 
          y: 0, 
          width: 12, 
          height: 7,
          frameCount: 6,
      }

      this.elapsedTime = 0
      this.velocity = velocity
      this.alpha = 1
      this.totalElapsedTime = 0
    }
  
    draw(c) {
      if (!this.loaded) return

      // canvas rendert dit spul raar dus je krijgt een zwart lijntje bij drawimg, door frames 2 en 3 aan te passen en iets op te schuiven gaat dat weg
      let dynamicDisplacement = -0.5
      if (this.currentFrame === 2){
        dynamicDisplacement = 0.5
      } else if (this.currentFrame === 3){
        dynamicDisplacement = -0.5
      } else{
        dynamicDisplacement = 0
      }
  
      c.save()
      c.globalAlpha = this.alpha
      c.drawImage(
        this.image, 
        this.currentSprite.x + this.currentSprite.width * this.currentFrame + dynamicDisplacement,
        this.currentSprite.y, 
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

        this.elapsedTime += deltaTime
        this.totalElapsedTime += deltaTime
        const intervalToGoToNextFrame = 0.15

        if (this.elapsedTime > intervalToGoToNextFrame) {
          this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
          this.elapsedTime -= intervalToGoToNextFrame
        }

        //update sprite position
        this.x += this.velocity.x
        this.y += this.velocity.y

        const leafLifeInterval = 15
        //update leaf opacity/alpha
        if (this.totalElapsedTime > leafLifeInterval) {
            this.alpha -= 0.01

            //clamp the alpha anders bugged hij vij het drawen, je kan niet onder 0
            this.alpha = Math.max(0, this.alpha)
        }
    }
  }