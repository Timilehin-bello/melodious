// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Vault
 * @author lamsya and the_first_elder
 * @notice  this is the vault contract for the Melodious
 */
contract Vault {
    address private admin;
    mapping(address => uint256) public artistListentime;
    uint256 public totalListentime;
    uint256 public constant THIRTYDAYS = 30 * 24 * 60 * 60;
    uint256 public currentTime = block.timestamp;
    IERC20 public token;
    address private communityPool;

    constructor(address _owner, address _token, address _communityPool) {
        admin = _owner;
        token = IERC20(_token);
        communityPool = _communityPool;
    }

    function artist(address[] memory _artistAddress, uint256[] memory _totalListentime) public {
        require(block.timestamp >= currentTime + THIRTYDAYS, "30 days has not passed");
        require(_artistAddress.length == _totalListentime.length, "Artist and totalListentime length must be same");
        require(msg.sender == admin, " Only admin can call this function");
        for (uint256 i = 0; i < _artistAddress.length; i++) {
            artistListentime[_artistAddress[i]] += _totalListentime[i];
            totalListentime += _totalListentime[i];
        }
    }

    function withdraw() public {
        require(artistListentime[msg.sender] > 0, "No listen time for the artist");
        if (block.timestamp >= currentTime + THIRTYDAYS) {
            // if thirty days has passed remove 30% of the token in the pool and transfer it to the community pool
            uint256 amountToRemove = token.balanceOf(address(this)) * 30 / 100;
            token.transfer(communityPool, amountToRemove);
            currentTime = block.timestamp;
        }
        // Calculate the amount to withdraw for the artist
        uint256 artistTokenAmount = availableAmount(msg.sender);
        require(artistTokenAmount > 0, "No available amount for withdrawal");

        // Reset the artist's listen time after withdrawal
        totalListentime -= artistListentime[msg.sender];
        artistListentime[msg.sender] = 0;
        // Transfer the calculated amount to the artist
        token.transfer(msg.sender, artistTokenAmount);
    }

    /**
     *  1000 listen time
     *  2000 tokens
     * artist a has 25 listentime
     *  amount available for artist a = (25 * 2000) / 1000 = 200
     */
    function availableAmount(address _artist) public view returns (uint256) {
        uint256 amountToRemove = 0;
        uint256 balance = token.balanceOf(address(this));
    
        if (block.timestamp >= currentTime + THIRTYDAYS) {
            // Calculate the 30% deduction if 30 days have passed
            amountToRemove = balance * 30 / 100;
            balance -= amountToRemove; // Adjust the balance after removing the community pool share
        }
    
        if (totalListentime == 0) {
            return 0; // Prevent division by zero if total listen time is zero
        }
    
        // Calculate the available amount for the artist based on the remaining balance
        uint256 availableAmountForArtist = (artistListentime[_artist] * balance) / totalListentime;
        return availableAmountForArtist;
    }
    
}
