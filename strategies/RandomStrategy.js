'use strict';

const _ = require('lodash');

let Strategy = require('../Strategy.js');


class RandomStrategy extends Strategy {


    constructor(options){
        const UNIFORM = 'uniform';
        options = options || {};
        super(options);
        if (options.distribution && options.distribution.type) {
            this.distribution = options.distribution;
        } else {
            this.distribution = {type: UNIFORM,max:1,min:0};
        }
    }

    _generateValue(){
        return distributions[this.distribution.type](this.distribution);
    }

    getValueAry(faker,startCount,stopCount){

        let valueAry = [];

        for (let i = startCount; i <= stopCount; i++){
            valueAry.push({
                count : i,
                value: this._generateValue()
            })
        }

        return valueAry;
    }

    generateValue(faker){
        console.log(faker);
        return {
            count: faker.counter,
            value: this._generateValue()
        }
    }
}

let distributions = {
    'uniform': function(distribution){
        let max = distribution.max;
        let min = distribution.min;
        let range = max - min;
        let value = min + range* Math.random();
        return value;
    },

    'normal': function(distribution){
        // todo: needs to actually generate normal distribution
        let mean = distribution.mean;
        let std = distribution.standard_deviation;
        return 1;
    }
};

module.exports = RandomStrategy;

