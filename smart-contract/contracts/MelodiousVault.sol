// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MelodiousVault is ReentrancyGuard {
    IERC20 public immutable ctsiToken;
    address public immutable admin;

    // Events for logging
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed admin, address indexed to, uint256 amount);

    constructor(IERC20 _ctsiToken, address _admin) {
        require(
            address(_ctsiToken) != address(0),
            "Invalid CTSI token address"
        );
        require(_admin != address(0), "Invalid admin address");

        ctsiToken = _ctsiToken;
        admin = _admin;
    }

    // Modifier to restrict access to the admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access restricted to admin");
        _;
    }

    // Deposit CTSI tokens into the vault
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer CTSI tokens from the sender to the contract
        bool success = ctsiToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "CTSI token transfer failed");

        emit Deposited(msg.sender, amount);
    }

    // Admin-only function to withdraw CTSI tokens to a specific address
    function withdraw(
        address to,
        uint256 amount
    ) external onlyAdmin nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");

        // Transfer CTSI tokens from the contract to the specified address
        bool success = ctsiToken.transfer(to, amount);
        require(success, "CTSI token transfer failed");

        emit Withdrawn(admin, to, amount);
    }

    // Function to get the contract's CTSI token balance
    function getVaultBalance() external view returns (uint256) {
        return ctsiToken.balanceOf(address(this));
    }
}
