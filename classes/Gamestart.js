class GameStart {
    constructor({x,y,}){
    this.x= x
    this.y = y
    this.width = 175.5
    this.height = 182
    this.loaded = false
      //we slaan een image op in this.image
      this.image = new Image()
      this.image.onload = () => {
        this.loaded = true
      }
      //imageSrc maakt de sprite dynamisch, dus de monsters kunnen verschillende sprites hebben, deze moet dan wel in constructor worden aangeroepen
      this.image.src = './images/GameStartv3.png'
    }

    draw(c) {
        //if this.loaded = false return en doe nog niks
        if (!this.loaded) return
    
        c.save()
        c.drawImage(
            this.image, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        )
        c.restore()
      }
}