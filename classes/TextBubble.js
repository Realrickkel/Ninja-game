class TextBubble {
    constructor({x,y,}){
    this.x = x
    this.y = y
    this.width = 230.5
    this.height = 56.1
    this.loaded = false
      //we slaan een image op in this.image
      this.image = new Image()
      this.image.onload = () => {
        this.loaded = true
      }
      //imageSrc maakt de sprite dynamisch, dus de monsters kunnen verschillende sprites hebben, deze moet dan wel in constructor worden aangeroepen
      this.image.src = './images/TalkAll.png'
      
      this.currentFrame = 0

      this.currentSprite = {
          x: 0, 
          y: 0, 
          width: 922,
          height: 224.3,
          frameCount: 6,
      }
    this.NPCTalkBubble = 0
    }

    correctTalkBubble(whichTalkBubble)
    {
     this.NPCTalkBubble = whichTalkBubble
     this.currentFrame = whichTalkBubble
    }

    draw(c) {
        //if this.loaded = false return en doe nog niks
        if (!this.loaded) return
    
        c.save()
        c.drawImage(
            this.image,
            this.currentSprite.x,
            this.currentSprite.height * this.currentFrame, 
            this.currentSprite.width, 
            this.currentSprite.height,  
            this.x, 
            this.y, 
            this.width, 
            this.height
        )
        c.restore()
      }
}