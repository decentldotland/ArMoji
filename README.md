<p align="center">
  <a href="https://decent.land">
    <img src="https://raw.githubusercontent.com/decentldotland/ark-protocol/main/img/new-logo.png" height="200">
  </a>
  <h3 align="center"><code>@decentdotland/ArMoji</code></h3>
  <p align="center">Emoji records for the ANS protocol</p>
</p>

## About 
ArMoji is a smart contract designed for composability with the [ANS protocol](https://ans.gg). It's built for the ANS protocol to enable ANS domains to generate emoji shortlinks. ArMoji provides a seamless and efficient experience for creating and sharing links on the Permaweb and beyond.

## Build and Run

```console
git pull https://github.com/decentldotland/armoji

npm install && npm run start
```

## Supported Emojis
ArMoji contract can support [all single code point emojis](https://unicode.org/emoji/charts/full-emoji-list.html) that are RGI (check [non-RGI](https://c.r74n.com/nonrgi) emoji list).

Check the current emoji's code points that are supported by the ArMoji [contract](https://github.com/decentldotland/ArMoji/blob/main/contract/armoji.json#L5)

## Contract

- [source code](./contract)
- live deployment: [I2S3OQ2WC6kQX7pHqdCSJvB8dAaGIYZNVkS3vuEoaEI](https://api.exm.dev/read/I2S3OQ2WC6kQX7pHqdCSJvB8dAaGIYZNVkS3vuEoaEI)

## Gateway
ArMojis are resolved under the arweave.bio gateway. an ArMoji can be assigned to an Arweave TXID or a URL. examples:

- [🤣🤣🤣.arweave.bio](http://🤣🤣🤣.arweave.bio) : Arweave TXID
- [🙂🙂🙂.arweave.bio](http://🙂🙂🙂.arweave.bio) : URL


## License
This project is licensed under the [MIT License](./LICENSE)
