const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = window.devicePixelRatio = 2
//const dpr = window.devicePixelRatio || 1

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

//we willen de hoogte en breedte van de map weten dat is dus het gehele getekende deel we gebruikten 28 columns en rows in mappenmaker dus die getallen doen we x 16 omdat per col/row we 16 pixels hebben
const MAP_COLS = 28
const MAP_ROWS = 28
const MAP_WIDTH = 16 * MAP_COLS
const MAP_HEIGHT = 16 * MAP_ROWS
//dpr is devicePixelRatio uit de browser, hieronder pakken we deze dpr en schalen die 3 keer groter om vervolgens bij de render onderin deze nieuwe value te pakken voor het laten zien van de juiste scale in de browser
const MAP_SCALE = dpr + 3
//dit is wat de camera ziet aan breedte pixels
const VIEWPORT_WIDTH = canvas.width / MAP_SCALE
const VIEWPORT_HEIGHT = canvas.height / MAP_SCALE
//Dit is het middelpint van de viewport op de X-axis en Y-axis
const VIEWPORT_CENTER_X = VIEWPORT_WIDTH / 2
const VIEWPORT_CENTER_Y = VIEWPORT_HEIGHT / 2
//We willen weten wat we maximaal naar rechts willen scrollen voordat de map ophoudt, dus door de gehele breedte van de zichtbare breedte af te halen krijgen we de maximale breedte die we willen schuiven met de camera, voor Y geldt hetzelfde maar dan met de hoogte
const MAX_SCROLL_X = MAP_WIDTH - VIEWPORT_WIDTH
const MAX_SCROLL_Y = MAP_HEIGHT - VIEWPORT_HEIGHT

var GameOverState = false
var GameStartState = true
var GameWinState = false
var WeCanTalk = false
var isTalking = false
var whichTalkBubble = 0

const layersData = {
   l_Terrain: l_Terrain,
   l_Trees_1: l_Trees_1,
   l_Trees_2: l_Trees_2,
   l_Trees_3: l_Trees_3,
   l_Trees_4: l_Trees_4,
   l_Landscape_Decorations: l_Landscape_Decorations,
   l_Landscape_Decorations_2: l_Landscape_Decorations_2,
   l_Houses: l_Houses,
   l_House_Decorations: l_House_Decorations,
   l_Characters: l_Characters,
   l_Collisions: l_Collisions,
};

//deze laag willen we voor de player renderen dus halen we hem los van de andere lagen
const frontRendersLayersData = {
  l_Front_Renders: l_Front_Renders,
}

const tilesets = {
  l_Terrain: { imageUrl: './images/terrain.png', tileSize: 16 },
  l_Front_Renders: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Trees_1: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Trees_2: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Trees_3: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Trees_4: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Landscape_Decorations: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Landscape_Decorations_2: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Houses: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_House_Decorations: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Characters: { imageUrl: './images/characters.png', tileSize: 16 },
  l_Collisions: { imageUrl: './images/characters.png', tileSize: 16 },
};


// Tile setup
const collisionBlocks = []
const blockSize = 16 // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16, // destination width, height
        )
      }
    })
  })
}

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));

  return offscreenCanvas
}
// END - Tile setup
const gameover = new GameOver({
  x: VIEWPORT_CENTER_X - 85.25,
  y: VIEWPORT_CENTER_Y - 43.75,
})

const gamestart = new GameStart({
  x: VIEWPORT_CENTER_X - 87.75,
  y: VIEWPORT_CENTER_Y - 91,
})

const gamewin = new GameWin({
  x: VIEWPORT_CENTER_X - 76,
  y: VIEWPORT_CENTER_Y - 86.25,
})

const textbubble = new TextBubble({
  x: VIEWPORT_WIDTH - 230.5 - ((VIEWPORT_WIDTH-230.5)/2),
  y: VIEWPORT_HEIGHT -56,
})


// Change xy coordinates to move player's default position
const player = new Player({
  x: 161,
  y: 128,
  size: 15,
})

const bgMusic = new SoundFX({})

//omdat we voor de bamboo en de dragon dezelfde values voor de spritesheet nodig hebben is het overzichtelijker om hem als constant te hebben en deze dan te hergebruiken in de monsters array(we zouden dit zelfs in een andere file kunnen zetten maar dat is voor nu wat overkill)
const monsterSprites = {
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
  }
}

// er zijn meerdere monsters dus stoppen we deze in een array met hun objecten
const monsters = [
  new Monster ({
    x: 300,
    y: 150,
    size: 15,
    imageSrc: './images/dragon.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 48,
    y: 400,
    size: 15,
    imageSrc: './images/bamboo.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 112,
    y: 416,
    size: 15,
    imageSrc: './images/dragon.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 288,
    y: 416,
    size: 15,
    imageSrc: './images/bamboo.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 400,
    y: 400,
    size: 15,
    imageSrc: './images/dragon.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 288,
    y: 256,
    size: 15,
    imageSrc: './images/bamboo.png',
    sprites: monsterSprites
  }),
  new Monster ({
    x: 144,
    y: 336,
    size: 15,
    imageSrc: './images/dragon.png',
    sprites: monsterSprites
  })

]

const spritesNPC = {
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
  idle: {
    x: 0, 
    y: 0, 
    width: 16,
    height: 16,
    frameCount: 1,
  }
}

const NPCs = [
  new NPC ({
    x: 80,
    y: 96,
    size: 15,
    imageSrcNPC: './images/inspector.png',
    NPCsprites: spritesNPC,
    FirstDirectionNPC: 'right',
    SecondDirectionNPC: 'idle',
    ThirdDirectionNPC: 'left',
    FourthDirectionNPC: 'idle',
    MovementLeftTimer: 0.4,
    MovementRightTimer: 0.4,
    MovementUpTimer: 0.4,
    MovementDownTimer: 0.4,
    FirstTimerNPCMovement: 0,
    SecondTimerNPCMovement: 1,
    ThirdTimerNPCMovement: 3,
    FourthTimerNPCMovement: 4,
    FifthTimerNPCMovement: 6,
    TalkBubble: 1,
  }),

  //red Samurai
  new NPC ({
    x: 384,
    y: 0,
    size: 15,
    imageSrcNPC: './images/redsamurai.png',
    NPCsprites: spritesNPC,
    FirstDirectionNPC: 'right',
    SecondDirectionNPC: 'idle',
    ThirdDirectionNPC: 'left',
    FourthDirectionNPC: 'idle',
    MovementLeftTimer: 0,
    MovementRightTimer: 0,
    MovementUpTimer: 0,
    MovementDownTimer: 0,
    FirstTimerNPCMovement: 0,
    SecondTimerNPCMovement: 0,
    ThirdTimerNPCMovement: 0,
    FourthTimerNPCMovement: 0,
    FifthTimerNPCMovement: 0,
    TalkBubble: 3,
  }),

  //girl
  new NPC ({
    x: 352,
    y: 160,
    size: 15,
    imageSrcNPC: './images/woman.png',
    NPCsprites: spritesNPC,
    FirstDirectionNPC: 'right',
    SecondDirectionNPC: 'up',
    ThirdDirectionNPC: 'down',
    FourthDirectionNPC: 'left',
    MovementLeftTimer: 0.8,
    MovementRightTimer: 0.8,
    MovementUpTimer: 0.8,
    MovementDownTimer: 0.8,
    FirstTimerNPCMovement: 0,
    SecondTimerNPCMovement: 0.6,
    ThirdTimerNPCMovement: 2,
    FourthTimerNPCMovement: 3.4,
    FifthTimerNPCMovement: 4,
    TalkBubble: 2,
  }),

  //dojo
  new NPC ({
    x: 288,
    y: 320,
    size: 15,
    imageSrcNPC: './images/samurai.png',
    NPCsprites: spritesNPC,
    FirstDirectionNPC: 'right',
    SecondDirectionNPC: 'idle',
    ThirdDirectionNPC: 'left',
    FourthDirectionNPC: 'idle',
    MovementLeftTimer: 0.4,
    MovementRightTimer: 0.4,
    MovementUpTimer: 0.4,
    MovementDownTimer: 0.4,
    FirstTimerNPCMovement: 0,
    SecondTimerNPCMovement: 1,
    ThirdTimerNPCMovement: 3,
    FourthTimerNPCMovement: 4,
    FifthTimerNPCMovement: 6,
    TalkBubble: 5,
  }),

  //oldman
  new NPC ({
    x: 48,
    y: 320,
    size: 15,
    imageSrcNPC: './images/oldman.png',
    NPCsprites: spritesNPC,
    FirstDirectionNPC: 'left',
    SecondDirectionNPC: 'right',
    ThirdDirectionNPC: 'down',
    FourthDirectionNPC: 'up',
    MovementLeftTimer: 0.2,
    MovementRightTimer: 0.2,
    MovementUpTimer: 0.2,
    MovementDownTimer: 0.2,
    FirstTimerNPCMovement: 0,
    SecondTimerNPCMovement: 1,
    ThirdTimerNPCMovement: 2,
    FourthTimerNPCMovement: 3,
    FifthTimerNPCMovement: 4,
    TalkBubble: 4,
  }),
]

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

let lastTime = performance.now()
let frontRendersCanvas
const hearts = [
  new Heart({
      x: 10,
      y: 10,
  }),
  new Heart({
    x: 32,
    y: 10,
  }),
  new Heart({
    x: 54,
    y: 10,
  }),
]

const leafs = [
  new Sprite({
    x: 20,
    y: 20,
    velocity: {
      x: 0.08,
      y: 0.08,
    }
  })
]

let elapsedTime = 0

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime
  elapsedTime += deltaTime

  if(elapsedTime > 1.5) {
    leafs.push(
      new Sprite({
        x: Math.random() * 150,
        y: Math.random() * 50,
        velocity: {
          x: 0.08,
          y: 0.08,
        }
      })
    )
    elapsedTime = 0
  }

  // Update player position
  player.handleInput(keys, GameOverState, GameStartState, GameWinState)
  player.update(deltaTime, collisionBlocks)
  //berekent de afstand van de playercenter naar het midden van de viewport. We clampen deze getallen tussen 0 en de max_scroll zodat we de camera niet verder laten scrollen dan de breedte en hoogte van de map
  const horizontalScrollDistance = 
  Math.min(Math.max(0, player.center.x - VIEWPORT_CENTER_X), MAX_SCROLL_X)
  const verticalScrollDistance = 
  Math.min(Math.max(0, player.center.y - VIEWPORT_CENTER_Y), MAX_SCROLL_Y)

  // Render scene
  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  //rendert de bewging van de camera
  c.translate(-horizontalScrollDistance, -verticalScrollDistance)
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.drawImage(backgroundCanvas, 0, 0)
  player.draw(c)

  for (let i = NPCs.length - 1; i >= 0; i--){
    const NPC = NPCs[i]
    NPC.update(deltaTime, isTalking)
    NPC.draw(c)

    //Talking with NPC's detection point
    if (player.x + player.width >= NPC.x - 1 &&
      player.x <= NPC.x + NPC.width + 1 && 
      player.y + player.height >= NPC.y - 1 && 
      player.y <= NPC.y + NPC.height + 1
      ) {
      WeCanTalk = true
      whichTalkBubble = NPC.TalkBubble
      }

       //Collision with NPC
      if (player.x + player.width >= NPC.x &&
        player.x <= NPC.x + NPC.width && 
        player.y + player.height >= NPC.y && 
        player.y <= NPC.y + NPC.height && !player.isInvincible
    ) {
      player.NPCCollision()
    }
  }

  //render out monsters, we willen achteraan beginnen anders krijg je flikkerend beeld
  for (let i = monsters.length - 1; i >= 0; i--){
    const monster = monsters[i]
    monster.update(deltaTime, collisionBlocks)
    monster.draw(c)
    

    //Detect for collision
    //If the right side of my attack box is equal to or greater then the monsters left side and so on for the other sides than register a collision
    if (player.attackBox.x + player.attackBox.width >= monster.x &&
        player.attackBox.x <= monster.x + monster.width && 
        player.attackBox.y + player.attackBox.height >= monster.y && 
        player.attackBox.y <= monster.y + monster.height &&
        player.isAttacking && !player.hasHitEnemy
    ) {
      monster.receiveHit()
      player.hasHitEnemy = true

      if(monster.health <= 0) {
        monsters.splice(i, 1)
      }
    }

    if(monsters.length == 0){
      GameWinState = true
    }

    // als de player wordt geraakt door een monster gaat player.receive hit lopen
    if (player.x + player.width >= monster.x &&
      player.x <= monster.x + monster.width && 
      player.y + player.height >= monster.y && 
      player.y <= monster.y + monster.height && !player.isInvincible
  ) {
      player.receiveHit(GameOverState, GameStartState)

      if(!GameOverState && !GameStartState){
      const filledHearts = hearts.filter(heart => heart.currentFrame === 4)

      //heart gaat eraf als je wordt geraakt
      if (filledHearts.length > 0){
        filledHearts[filledHearts.length - 1].currentFrame = 0
      }

      //game over
      if (filledHearts.length <= 1) {
        GameOverState = true
      }
    }
  }
  }

  c.drawImage(frontRendersCanvas, 0, 0)
  
  for (let i = leafs.length - 1; i >= 0; i--){
    const leaf = leafs[i]
    leaf.update(deltaTime)
    leaf.draw(c)

    if(leaf.alpha <= 0) {
      leafs.splice(i,1)
    }
  }
  
  c.restore()

  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  hearts.forEach(heart => {
    heart.draw(c)
  })
  c.restore()

  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  if(isTalking == true){
    textbubble.correctTalkBubble(whichTalkBubble)
    textbubble.draw(c)
  }
  c.restore()

  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  if(GameStartState == true){
    gamestart.draw(c)
  }
  c.restore()

  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  if(GameOverState == true){
    gameover.draw(c)
  }
  c.restore()

  c.save()
  c.scale(MAP_SCALE, MAP_SCALE)
  if(GameWinState == true){
    gamewin.draw(c)
  }
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas))
}

const startRendering = async () => {
  try {
    const backgroundCanvas = await renderStaticLayers(layersData)
    frontRendersCanvas = await renderStaticLayers(frontRendersLayersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

startRendering()

