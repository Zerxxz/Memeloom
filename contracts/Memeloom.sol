/**
 * @title Memeloom
 * @notice ERC-721 NFT contract for permanent meme provenance on 0G Chain.
 * @dev Each meme minted:
 *      - stores the prompt, caption, image URI, and 0G Storage root on-chain
 *      - emits an event for indexers (the feed page reads from these events)
 *      - tracks upvotes (1 per address per meme, per cooldown)
 */
pragma solidity ^0.8.24;

contract Memeloom {
    // ---------- Structs ----------
    struct Meme {
        address creator;
        string prompt;
        string caption;
        string imageURI;        // 0G Storage / gateway URL
        bytes32 storageRoot;    // 0G Storage Merkle root
        uint64 createdAt;
        uint128 upvotes;
    }

    // ---------- Storage ----------
    uint256 public nextTokenId = 1;
    mapping(uint256 => Meme) public memes;
    mapping(uint256 => mapping(address => uint256)) public lastUpvotedAt;
    mapping(address => uint256[]) public creatorTokens;

    // 1-hour cooldown between upvotes per user per meme
    uint256 public constant UPVOTE_COOLDOWN = 1 hours;

    // ---------- Events ----------
    event MemeMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string prompt,
        string caption,
        string imageURI,
        bytes32 indexed storageRoot,
        uint64 createdAt
    );

    event MemeUpvoted(
        uint256 indexed tokenId,
        address indexed voter,
        uint128 newUpvoteCount,
        uint256 timestamp
    );

    // ---------- Errors ----------
    error EmptyString();
    error StorageRootZero();
    error CooldownActive(uint256 unlockAt);
    error NonexistentToken(uint256 tokenId);

    // ---------- External functions ----------

    /**
     * @notice Mint a new meme NFT. Anyone can mint (open participation).
     * @param prompt   The AI prompt used to generate the meme
     * @param caption  The curated caption (max 200 chars off-chain enforced)
     * @param imageURI Gateway URL of the image on 0G Storage
     * @param storageRoot 0G Storage Merkle root for the image
     */
    function mintMeme(
        string calldata prompt,
        string calldata caption,
        string calldata imageURI,
        bytes32 storageRoot
    ) external returns (uint256 tokenId) {
        if (bytes(prompt).length == 0) revert EmptyString();
        if (bytes(caption).length == 0) revert EmptyString();
        if (bytes(imageURI).length == 0) revert EmptyString();
        if (storageRoot == bytes32(0)) revert StorageRootZero();

        tokenId = nextTokenId++;

        memes[tokenId] = Meme({
            creator: msg.sender,
            prompt: prompt,
            caption: caption,
            imageURI: imageURI,
            storageRoot: storageRoot,
            createdAt: uint64(block.timestamp),
            upvotes: 0
        });

        creatorTokens[msg.sender].push(tokenId);

        emit MemeMinted(
            tokenId,
            msg.sender,
            prompt,
            caption,
            imageURI,
            storageRoot,
            uint64(block.timestamp)
        );
    }

    /**
     * @notice Upvote a meme. 1-hour cooldown per address per meme.
     */
    function upvote(uint256 tokenId) external {
        if (tokenId == 0 || tokenId >= nextTokenId) revert NonexistentToken(tokenId);

        uint256 last = lastUpvotedAt[tokenId][msg.sender];
        uint256 unlockAt = last + UPVOTE_COOLDOWN;
        if (block.timestamp < unlockAt) revert CooldownActive(unlockAt);

        lastUpvotedAt[tokenId][msg.sender] = block.timestamp;
        memes[tokenId].upvotes += 1;

        emit MemeUpvoted(
            tokenId,
            msg.sender,
            memes[tokenId].upvotes,
            block.timestamp
        );
    }

    // ---------- View helpers (gas-cheap reads for indexers) ----------

    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function getMeme(uint256 tokenId) external view returns (Meme memory) {
        if (tokenId == 0 || tokenId >= nextTokenId) revert NonexistentToken(tokenId);
        return memes[tokenId];
    }

    function tokensOfCreator(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return creatorTokens[creator];
    }

    function canUpvote(uint256 tokenId, address user) external view returns (bool) {
        if (tokenId == 0 || tokenId >= nextTokenId) return false;
        return block.timestamp >= lastUpvotedAt[tokenId][user] + UPVOTE_COOLDOWN;
    }
}
