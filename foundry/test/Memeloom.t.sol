// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Memeloom.sol";

contract MemeloomTest is stdTest, Memeloom { }
import "forge-std/Test.sol";

contract MemeloomTest is Test {
    Memeloom internal loom;
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    event MemeMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string prompt,
        string caption,
        string imageURI,
        bytes32 indexed storageRoot,
        uint64 createdAt
    );

    function setUp() public {
        loom = new Memeloom();
    }

    function test_MintAssignsTokenIdAndStoresFields() public {
        bytes32 root = keccak256("test-storage-root");
        vm.expectEmit(true, true, false, true);
        emit MemeMinted(
            1,
            alice,
            "doge with laser eyes",
            "when moon",
            "https://example.com/meme.png",
            root,
            uint64(block.timestamp)
        );

        vm.prank(alice);
        uint256 id = loom.mintMeme(
            "doge with laser eyes",
            "when moon",
            "https://example.com/meme.png",
            root
        );
        assertEq(id, 1);
        assertEq(loom.nextTokenId(), 2);
        assertEq(loom.totalSupply(), 1);

        Memeloom.Meme memory m = loom.getMeme(1);
        assertEq(m.creator, alice);
        assertEq(m.prompt, "doge with laser eyes");
        assertEq(m.caption, "when moon");
        assertEq(m.imageURI, "https://example.com/meme.png");
        assertEq(m.storageRoot, root);
        assertEq(m.upvotes, 0);
        assertEq(m.createdAt, uint64(block.timestamp));

        uint256[] memory tokens = loom.tokensOfCreator(alice);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], 1);
    }

    function test_RevertEmptyStrings() public {
        bytes32 root = keccak256("root");
        vm.expectRevert(Memeloom.EmptyString.selector);
        loom.mintMeme("", "caption", "uri", root);

        vm.expectRevert(Memeloom.EmptyString.selector);
        loom.mintMeme("prompt", "", "uri", root);

        vm.expectRevert(Memeloom.EmptyString.selector);
        loom.mintMeme("prompt", "caption", "", root);
    }

    function test_RevertZeroStorageRoot() public {
        vm.expectRevert(Memeloom.StorageRootZero.selector);
        loom.mintMeme("p", "c", "uri", bytes32(0));
    }

    function test_UpvoteIncrements() public {
        bytes32 root = keccak256("root");
        vm.prank(alice);
        uint256 id = loom.mintMeme("p", "c", "uri", root);

        vm.prank(bob);
        loom.upvote(id);
        assertEq(loom.getMeme(id).upvotes, 1);

        // cooldown active
        vm.expectRevert(
            abi.encodeWithSelector(Memeloom.CooldownActive.selector, block.timestamp + 1 hours)
        );
        vm.prank(bob);
        loom.upvote(id);
    }

    function test_UpvoteCooldownExpires() public {
        bytes32 root = keccak256("root");
        vm.prank(alice);
        uint256 id = loom.mintMeme("p", "c", "uri", root);

        vm.prank(bob);
        loom.upvote(id);

        vm.warp(block.timestamp + 1 hours);
        vm.prank(bob);
        loom.upvote(id);
        assertEq(loom.getMeme(id).upvotes, 2);
    }

    function test_RevertUpvoteNonexistent() public {
        vm.expectRevert(
            abi.encodeWithSelector(Memeloom.NonexistentToken.selector, 999)
        );
        loom.upvote(999);
    }

    function test_CanUpvoteReflectsCooldown() public {
        bytes32 root = keccak256("root");
        vm.prank(alice);
        uint256 id = loom.mintMeme("p", "c", "uri", root);

        assertTrue(loom.canUpvote(id, bob));
        vm.prank(bob);
        loom.upvote(id);
        assertFalse(loom.canUpvote(id, bob));
    }

    function test_FuzzMint(uint64 ts) public {
        vm.warp(ts);
        bytes32 root = keccak256(abi.encode(ts));
        vm.prank(alice);
        uint256 id = loom.mintMeme("p", "c", "uri", root);
        assertEq(loom.getMeme(id).createdAt, ts);
    }
}
