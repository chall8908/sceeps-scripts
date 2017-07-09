const role = {
    run: function (creep) {
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if(hostile) {
            if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, { visualizePathStyle: { stroke: '#ff0000', opacity: 0.2 } });
            }
        }
    }
};

export default role;
