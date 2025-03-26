class GRBLCommandGenerator {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.feedRate = 0;
    }

    setX(value) {
        this.x = value;
        return this;
    }

    setY(value) {
        this.y = value;
        return this;
    }

    setZ(value) {
        this.z = value;
        return this;
    }

    setFeedRate(value) {
        this.feedRate = value;
        return this;
    }

    generateCommand() {
        // Construit la commande en utilisant les valeurs actuelles
        let command = "$J=G21G91";

        if (this.z !== 0) command += `Z${this.z}`;
        if (this.x !== 0) command += `X${this.x}`;
        if (this.y !== 0) command += `Y${this.y}`;
        if (this.feedRate > 0) command += `F${this.feedRate}`;

        return command;
    }
}

const command = new GRBLCommandGenerator()

module.exports = {
    command
}