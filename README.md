# middleware-eth-nem-action-processor [![Build Status](https://travis-ci.org/ChronoBank/middleware-eth-nem-action-processor.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eth-nem-action-processor)

Middleware service for transferring welcome and deposit bonues

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for transferring welcome and deposit bonuses (as chronobank's NEM's mosaics to user's address).


#### How does it work

There are 2 cases, when you can recieve some mosaic's minutes on your presonal count:
1) when you fill in profile
2) when you make a deposit

Under the hood, this module tracks events from  [sc-processor](https://github.com/ChronoBank/middleware-eth-chrono-sc-processor). In case, we meet setHash event (which stands for user fill profile's action) or deposit event - we just grab the address of user, and amount of deposit (in case it's deposit event) - and transfer him mosaics on his NEM's address

##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_ACCOUNTS_URI=mongodb://localhost:27017/data
MONGO_ACCOUNTS_COLLECTION_PREFIX=eth
RABBIT_URI=amqp://localhost:5672
RABBIT_SERVICE_NAME: 'app_eth'
NETWORK=development
WEB3_URI=/tmp/development/geth.ipc
NEM_NETWORK=-104
NEM_MOSAIC_NAME=cb:minutes
NEM_TX_FEE=9000
NEM_HOST=localhost
NEM_PORT=7890
NEM_PRIVATE_KEY=123456
NEM_PASSWORD=123
NEM_ACTIONS=welcomeBonus,timeBonus
NEM_BONUS_RATE=60
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| MONGO_DATA_URI   | the URI string for mongo connection, which holds data collections (for instance, processed block's height). In case, it's not specified, then default MONGO_URI connection will be used)
| MONGO_DATA_COLLECTION_PREFIX   | the collection prefix for data collections in mongo (If not specified, then the default MONGO_COLLECTION_PREFIX will be used)
| RABBIT_URI   | rabbitmq URI connection string
| RABBIT_SERVICE_NAME   | namespace for all rabbitmq queues, like 'app_eth_transaction'.
| NETWORK   | network name (alias)- is used for connecting via ipc (see block processor section).
| WEB3_URI   | the path to ipc interface.

| NEM_NETWORK   | NEM'S network id. The default value is -104.
| NEM_MOSAIC_NAME   | NEM'S mosaic id. The default value is cb:minutes.
| NEM_TX_FEE   | NEM'S fee for the transaction. The default value is calculated with nem-sdk.
| NEM_HOST   | the host address of NEM's node
| NEM_PORT   | the port of NEM's node.
| NEM_PRIVATE_KEY   | NEM's private key from cold wallet, from which transfers will be emitted.
| NEM_PASSWORD   | NEM's password for the specified private key. Param is optional.
| NEM_ACTIONS   | actions, you wish to run. Optional param. The default value is welcomeBonus,timeBonus
| NEM_BONUS_RATE   | bonus convertation rate (is used to convert the deposit unit to mosaic's value). The default value is 60
| SYSTEM_RABBIT_URI   | rabbitmq URI connection string for infrastructure
| SYSTEM_RABBIT_SERVICE_NAME   | rabbitmq service name for infrastructure
| SYSTEM_RABBIT_EXCHANGE   | rabbitmq exchange name for infrastructure
| CHECK_SYSTEM | check infrastructure or not (default = true)



License
----

MIT
