class Heart {
  constructor({ x, y, size, }) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 20
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
    this.image.src = './images/heart.png'

    this.currentFrame = 4
    
    //Onze heart image heeft maar 1 cropbox nodig
    this.currentSprite = {
        x: 0, 
        y: 0, 
        width: 16, 
        height: 16,
        frameCount: 4,
    }
  }



  draw(c) {
    //if this.loaded = false return en doe nog niks
    if (!this.loaded) return

    c.drawImage(
      this.image, 
      this.currentSprite.x + this.currentSprite.width * this.currentFrame,
      this.currentSprite.y, 
      this.currentSprite.width, 
      this.currentSprite.height, 
      this.x, 
      this.y, 
      this.width, 
      this.height
    )
    }
}