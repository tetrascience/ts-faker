# ts-faker
[![Build Status](https://travis-ci.org/tetrascience/ts-lib-faker.svg?branch=master)](https://travis-ci.org/tetrascience/ts-lib-faker)

Create a time series data stream. Here are the highlights:
 
* support comprehensive faking strategies for [random](#random), [sinusoidal](#sine), square wave, file
* support user defined strategies, 

## Usage
```bash
npm install tetrascience/ts-faker
```

Here is a one simple example
```javascript
const min = 60*1000;

const Faker = require('ts-faker');
const SineStrategy = Faker.strategies.Sine;

const sine = new SineStrategy({
    period_count: 10,
    amplitude: 1000,
    phase_shift: Math.PI
});
const faker = new Faker({
    strategy:sine,
    interval: 5000
});
faker.begin();
setTimeout(faker.end, 2 * min);

const now = new Date().getTime();
const oneMinAgo = now - 1 * min;

faker.getData(oneMinAgo, now); 
// return [], since faker was not began during that time range

setTimeout(faker.getData.bind(faker,oneMinAgo, now), 1 * min);
// return [dp1, dp2, ....] 

faker.on("new_data",function(dataPoint){
    console.log(dataPoint)
});
```

More examples can be found in the [examples](/examples) folder

## Faker
Every faker has one simple job -- keeps ticking based on user specified interval. 
Every time faker ticks, it leverages the [strategy](#strategies) to generate a [data point](#data-point) 
and its counter gets incremented. 

### `new Faker(options)`
The constructor takes the following options to create a faker. 
* `interval`: the interval between data points, in ms. For example 1000. Default is 5000.
* `strategy`: the strategy object that generate the fake data at each tick of the faker. 
You can pick from the [ones support natively](#Strategies).

### `getData(startTime, stopTime, enableHistory)`
Retrieve the data within a certain time range.
* `enableHistory`: if true, `getData` can return historical data
  before fake begins.
* Output: an array of [data points](#data-point) in the time range.

### `Event: "new_data"`
The `new_data` event will be emitted with a [data point](#data-point) whenever there is a 
new data point generated.

## Strategies
Strategy does not have the concept of time. It's only aware of counts (the number of ticks that the faker has experienced).

### Strategy API
Each strategy must support the following APIs.

#### `generateValue(faker)`
Generate a value point based 
* Input: a faker object
* Output: a [value point](#value-point)

#### `getValueAry(faker, startCount, stopCount)`
* Input: a the faker object, start count and stop count
* Output: an array of [value points](#value-point)



### Strategies available
The faker supports the *following strategies*
#### `Random`
It supports the following distributions
  * Uniform distribution 
  * Normal distribution (in progress)

#### `Square wave`

```
let SquareWaveStrategy = require('../../strategies/SquareWaveStrategy.js');
let squareWave = new SquareWaveStrategy({
    period_count: 60*1000 / 5000, // period is 1 min
    duty_cycle: 0.3,              // percent of time the value is at high_value
    high_value: 20,               // high value of the square wave
    low_value: 5,                 // low value of the square wave
    variation: 1                  // introduce a little noise to the square wave
});
```

#### `Sine`
#### `File`
#### `Fixed values`
#### `JSON Schema`
This strategy accepts JSON schema as input parameter and generates random objects based on
that schema.

Input JSON schema can be standard one, without any custom descriptive fields. In that case, values generated will
be random and without any particular meaning (random numbers, random strings, etc.). This is useful when simple 
integers are needed, or values that match some regular expression. 

For example, with following schema:

```
{
  "properties": {
    "type": {
      "enum": [
        "disk"
      ]
    },
    "label": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
    }
  },
  "required": [
    "type",
    "label"
  ],
  "additionalProperties": false
}
``` 
JSON schema faker strategy will produce object like this:

```
{
  "type": "disk",
  "label": "De5D1c5A-7Bca-37A4-A186-bb5A2Ccd9Aa2"
}
```
This is OK when we don't need any advanced logic behind generated values. However, in cases when we
need some kind of advanced generation logic for fields, we can set up faker API methods. In other words,
each field in JSON schema can be configured to use specific generator. For example:

```
{
    "deviceId": {
      "type": "string",
      "description": "Device ID",
      "pattern": "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
    },
    "name": {
      "type": "string",
      "description": "Device name",
      "faker": "commerce.productName"
    },
    "type": {
      "type": "string",
      "description": "Device type",
      "faker": "company.companyName"
    },
    "city": {
      "type": "string",
      "description": "Location",
      "faker": "address.city"
    }
  }
``` 
Notice that in this JSON schema we have `faker` API methods for fields `name`, `type` and `city`.

In this scenario we have following rules:
* `deviceId` is of type string and string that satisfies regex will be produced
* `name` field uses JS faker API method `commerce.productName` to generate value - that means that random 
'meaningful' product name will be generated
* `type` field uses JS faker API method `company.companyName` to produce some random 'meaningful' company name
* `city` field uses JS faker API method `address.city` to produce some random 'meaningful' city name.

Schema configured this way would yield object like this:

````
{ 
    "deviceId": "9f8598B1-7cE0-9bc0-E4e6-4e5ef53DF8FD",    
    "name": "Practical Frozen Chips",
    "type": "Kuhlman, Lehner and Dooley",
    "city": "Calechester" 
}
````

Complete list of all available fake API methods can be found at following location:
https://github.com/marak/Faker.js/

### Contribute your strategy
* put new strategies in the `strategies` folder and add it to the `strategies/index.js` file
* add test in the test folder
* add instruction to this readme file

## Basic concepts

### Value point 
```javascript
{ 
     count: 10,
     value: 5 // The value can be string or buffer, such as `new Buffer("humdity:60%")`. 
}
``` 
### Data point 
Data point is always an object that has a timestamp and a value.
```javascript
{
    timestamp: new Date().getTime(), // time in ms 
    value: 0.5
}
```

The value can be string or buffer, such as `new Buffer("humdity:60%")`. 
```javascript
{
    timestamp: new Date().getTime(), // time in ms
    value: "error: water level low"
}
```

## Todo 
* add test/readme for fixedValueStrategy
* add unit test for the strategies.
* support type buffer
* template an object 
