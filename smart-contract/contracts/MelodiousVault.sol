// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Cartesi Input Box interface
interface IInputBox {
    function addInput(
        address dapp,
        bytes calldata input
    ) external returns (bytes32);
}

contract MelodiousVault is ReentrancyGuard {
    IERC20 public immutable ctsiToken;
    address public immutable admin;
    IInputBox public inputBox;
    address public dappAddress;

    // Subscription pricing
    uint256 public subscriptionPrice;

    // Events for logging
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed admin, address indexed to, uint256 amount);
    event Subscribed(address indexed user, uint256 amount, uint256 timestamp);
    event SubscriptionPriceUpdated(uint256 newPrice);

    constructor(
        IERC20 _ctsiToken,
        address _admin,
        address _inputBox,
        address _dappAddress,
        uint256 _subscriptionPrice
    ) {
        require(
            address(_ctsiToken) != address(0),
            "Invalid CTSI token address"
        );
        require(_admin != address(0), "Invalid admin address");
        require(_inputBox != address(0), "Invalid InputBox address");
        require(_dappAddress != address(0), "Invalid DApp address");
        require(
            _subscriptionPrice > 0,
            "Subscription price must be greater than zero"
        );

        ctsiToken = _ctsiToken;
        admin = _admin;
        inputBox = IInputBox(_inputBox);
        dappAddress = _dappAddress;
        subscriptionPrice = _subscriptionPrice;
    }

    // Modifier to restrict access to the admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access restricted to admin");
        _;
    }

    // Subscribe function - handles payment and sends payload to Cartesi
    function subscribe(bytes calldata payload) external nonReentrant {
        require(payload.length > 0, "Payload cannot be empty");

        // Check user's CTSI balance
        uint256 userBalance = ctsiToken.balanceOf(msg.sender);
        require(
            userBalance >= subscriptionPrice,
            "Insufficient CTSI balance for subscription"
        );

        // Check allowance
        uint256 allowance = ctsiToken.allowance(msg.sender, address(this));
        require(
            allowance >= subscriptionPrice,
            "Insufficient CTSI allowance for subscription"
        );

        // Transfer CTSI tokens from user to vault
        bool success = ctsiToken.transferFrom(
            msg.sender,
            address(this),
            subscriptionPrice
        );
        require(success, "CTSI token transfer failed");

        // Send payload to Cartesi backend
        inputBox.addInput(dappAddress, payload);

        emit Subscribed(msg.sender, subscriptionPrice, block.timestamp);
    }

    // Admin function to update subscription price
    function updateSubscriptionPrice(uint256 _newPrice) external onlyAdmin {
        require(_newPrice > 0, "Subscription price must be greater than zero");
        subscriptionPrice = _newPrice;
        emit SubscriptionPriceUpdated(_newPrice);
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

    // Function to get current subscription price
    function getSubscriptionPrice() external view returns (uint256) {
        return subscriptionPrice;
    }
}
