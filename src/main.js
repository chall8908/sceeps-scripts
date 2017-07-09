require('creep.overrides'); // Prototype modifications etc.

// const SpawnUtils = require('spawns');
const { processRoom } = require('spawns'),
      { cleanupMemory } = require('utils');


// Check for dead creeps every 25 ticks
if(!Memory.checkCounter && Memory.checkCounter !== 0) {
  Memory.checkCounter = 0;
}

module.exports.loop = function () {
  for(let spawnName in Game.spawns) {
    processRoom(Game.spawns[spawnName]);
  }

  if(Memory.checkCounter > 25) {
    for(let name in Memory.creeps) {
      if(!Game.creeps[name]) {
        cleanupMemory(name);
      }
    }
    Memory.checkCounter = 0;
  }

  Memory.checkCounter++;

  for(let sourceID in Memory.sources) {
    let source = Memory.sources[sourceID],
        obj = Game.getObjectById(sourceID);
    obj.room.visual.text('🔄 ' + source.workableSpots + '/' + source.maxWorkableSpots, obj.pos.x, obj.pos.y - 1, { font: 0.5, stroke: '#000000', opacity: 0.7 })
  }
}
