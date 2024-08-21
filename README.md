
# Setup

Go to [etherscan](https://etherscan.io) and [basescan](https://basescan.io) and copy the "Last Finalized Block" into the `startBlock` for each chain in  `ponder.config.ts`. This will make synching much much faster due to the high number of transactions since the genesis block.

Install [OrbStack](https://orbstack.dev/) and turn off plain old docker for a faster experience.

`0xb2cc224c1c9feE385f8ad6a55b4d94E92359DC59` is an address on Base with a lot of transactions. You can use it to test the app.

```bash
$ docker-compose up --build
$ curl -X POST http://localhost:80/watchAddress/0xb2cc224c1c9feE385f8ad6a55b4d94E92359DC59
$ open index.html
```
