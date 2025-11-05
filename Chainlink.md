# Chainlink Integration Guide

This guide will show you how to create a Token Shop to sell yout token paying with native token, sending the native token to the Token Shop address.

The token is updated to have only 2 decimal places, like fiat money, and to have AccessControl, instead of Ownable, to manage the mint permission.

- The goal is to create a TokenShop to sell the token.
- The TokenShop has a token price defined, 2usd per token.
- The user will send some amount in Eth(or native token) to the contract.
- It will use Chainlink Data Feed ETH/USD rate to calculate how many tokens the user can buy using the Eth amount sent.
- The contract will mint tokens to the user account.

## On Celo - Example

BuenoToken

[0xe9689CF0Ffe9e4c6E9955f287a91697d18Ae7676]
(https://celoscan.io/address/0xe9689cf0ffe9e4c6e9955f287a91697d18ae7676)

BuenoTokenShop
[0x0E8E76A22AbbCC4ab0B0FCf8d7b7eC0f4fB7140A]
(https://celoscan.io/address/0xFc929B3cE0D9C618cE0146Ad228322Bc51Afb709)

