// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface TokenInterface {
    function mint(address account, uint256 amount) external;
}

contract BuenoTokenShop {
    
	AggregatorV3Interface internal priceFeed;
	TokenInterface public token;
	uint256 public tokenPrice = 1; //1 token = 0.01 usd, with 2 decimal places
	address public owner;
    
	constructor(address tokenAddress) {
    	token = TokenInterface(tokenAddress);
        /**
        * https://docs.chain.link/data-feeds/price-feeds/addresses
        * 
        * Network: Celo
        * Aggregator: CELO/USD
        * Address: 0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e
		*
		* https://data.chain.link/feeds/celo/mainnet/celo-usd
        */

        priceFeed = AggregatorV3Interface(0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e);
        owner = msg.sender;
	}

	/**
 	* Returns the latest answer
 	*/
	function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    	(
        	/*uint80 roundID*/,
        	int price,
        	/*uint startedAt*/,
        	/*uint timeStamp*/,
        	/*uint80 answeredInRound*/
    	) = priceFeed.latestRoundData();
    	return price;
	}

	function tokenAmount(uint256 amountETH) public view returns (uint256) {
    	//Sent amountETH, how many usd I have
    	uint256 ethUsd = uint256(getChainlinkDataFeedLatestAnswer());		//with 8 decimal places
    	uint256 amountUSD = amountETH * ethUsd / 10**18; //ETH = 18 decimal places
    	uint256 amountToken = amountUSD / tokenPrice / 10**(8/2);  //8 decimal places from ETHUSD / 2 decimal places from token 
    	return amountToken;
	} 

	uint256 public lastTokenAmount;
	uint256 public lastCeloAmount;
	receive() external payable {
		lastCeloAmount = msg.value;
    	uint256 amountToken = tokenAmount(msg.value);
		lastTokenAmount = amountToken;
    	token.mint(msg.sender, amountToken);
	}

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function mintToken(address account, uint256 amount) public onlyOwner {
        token.mint(account, amount);
    } 
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }    
}
