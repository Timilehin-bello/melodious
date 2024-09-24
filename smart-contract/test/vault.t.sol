// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "./mock/MockERC20.sol";
import {console} from "forge-std/Test.sol";

contract VaultTest is Test {
    Vault public vault;
    MockERC20 public token;
    address admin;
    address communityPool;
    address [] public artists = new address[](2);
    address [] public newArtists = new address[](10);
    uint [] public listenTimes = new uint[](2);
    uint [] public newListenTimes = new uint[](10);
    address artist1;
    address artist2;

    function setUp() public {
        admin = address(this); // Assign the test contract itself as the admin
        communityPool = address(0x1234); // Mock community pool address
        artist1 = address(0x1111); // Mock artist 1 address
        artist2 = address(0x2222); // Mock artist 2 address

        // Deploy the mock token and the vault contract
        token = new MockERC20();
        vault = new Vault(admin, address(token), communityPool);

        // Mint tokens to the vault contract for testing
        token.mint(address(vault), 1000 ether);
    }

    function testAddArtistListenTime() public {


        artists[0] = artist1;
        artists[1] = artist2;
        listenTimes[0] = 500;
        listenTimes[1] = 300;

        // Move the timestamp forward by 30 days
        vm.warp(block.timestamp + 30 days);

        // Admin adds artist listen times
        vault.artist(artists, listenTimes);

        assertEq(vault.artistListentime(artist1), 500);
        assertEq(vault.artistListentime(artist2), 300);
        assertEq(vault.totalListentime(), 800);
    }

    function testArtistWithdrawal() public {


        artists[0] = artist1;
        listenTimes[0] = 1000;

        // Move the timestamp forward by 30 days
        vm.warp(block.timestamp + 30 days);

        // Admin adds listen time for artist 1
        vault.artist(artists, listenTimes);

        // Check available tokens for artist 1
        uint256 availableTokens = vault.availableAmount(artist1);
        assertEq(availableTokens, 700 ether); // Since artist1 has 100% of total listen time

        // Artist 1 withdraws their tokens
        vm.prank(artist1); // Simulate artist1 calling the contract
        vault.withdraw();

        // Check that artist1 received tokens and their listen time was reset
        assertEq(token.balanceOf(artist1), 700 ether);
        assertEq(vault.artistListentime(artist1), 0);
    }

    function testCommunityPoolDeduction() public {


        artists[0] = artist1;
        listenTimes[0] = 1000;

        // Move the timestamp forward by 30 days
        vm.warp(block.timestamp + 30 days);

        // Admin adds listen time for artist 1
        vault.artist(artists, listenTimes);

        // Move the timestamp forward by another 30 days to trigger community pool deduction
        vm.warp(block.timestamp + 30 days);

        // Check available tokens for artist 1 before withdrawal
        uint256 availableTokens = vault.availableAmount(artist1);
        assertEq(availableTokens, 700 ether);

        // Artist 1 withdraws, which should also trigger the 30% transfer to the community pool
        vm.prank(artist1);
        vault.withdraw();

        // Check that 30% was transferred to the community pool
        uint256 communityPoolBalance = token.balanceOf(communityPool);
        assertEq(communityPoolBalance, 300 ether);

        // Artist 1 should receive 70% of the tokens
        assertEq(token.balanceOf(artist1), 700 ether);
    }

    function testAddMultipleArtistsAndWithdraw() public {
        // Setup 10 artist addresses and listen times
        for (uint256 i = 0; i < 10; i++) {
            newArtists[i] = address(uint160(i + 1)); // Mock unique artist addresses
            newListenTimes[i] = (i + 1) * 100; // Each artist has an incrementally higher listen time
        }

        // Move the timestamp forward by 30 days
        vm.warp(block.timestamp + 30 days);

        // Admin adds the listen times for the artists
        vault.artist(newArtists, newListenTimes);

        // Assert the listen times and total listen time in the contract
        uint256 expectedTotalListenTime = 0;
        for (uint256 i = 0; i < 10; i++) {
            assertEq(vault.artistListentime(newArtists[i]), (i + 1) * 100);
            expectedTotalListenTime += (i + 1) * 100;
        }
        console.log("expected expectedTotalListenTime ",expectedTotalListenTime);
        assertEq(vault.totalListentime(), expectedTotalListenTime); // Total listen time should match sum
        // 30% after 30 days 

        // Simulate withdrawal for each artist
        for (uint256 i = 0; i < 10; i++) {
            uint256 availableTokens = vault.availableAmount(newArtists[i]);
            uint256 remainingTokens = (1000 ether * 70) / 100; // 70% of total pool remains after 30% deduction
            uint256 expectedTokens = ((i + 1) * 100 * remainingTokens) / expectedTotalListenTime; // Proportional to listen time
            console.log("availableTokens for each artist ",availableTokens);
            console.log("expectedTokens for each artist ",expectedTokens);

            assertApproxEqAbs(availableTokens, expectedTokens, 10);

            // Simulate artist withdrawing their tokens
            vm.prank(newArtists[i]);
            vault.withdraw();

            // Check that artist received tokens and their listen time was reset
            assertApproxEqAbs(token.balanceOf(newArtists[i]), expectedTokens, 10);
            assertEq(vault.artistListentime(newArtists[i]), 0);
        }
    }
}
