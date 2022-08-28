//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract DVideos is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    Counters.Counter private _suscriptionIds;

    address payable owner;

    uint256 listPrice = 0.001 ether;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool currentlyListed;
        bool isForSuscriberOnly;
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        uint256 price,
        bool currentlyListed
    );

    struct Suscription {
        address creator;
        uint256 price;
        mapping(address => uint256) suscribers;
    }

    mapping(uint256 => ListedToken) public idToListedToken;

    mapping(uint256 => Suscription) public suscriptions;
    mapping(address => uint256) public balance;

    constructor() ERC721("dVideos", "DV") {
        owner = payable(msg.sender);
    }

    function createSuscription(uint256 price) public returns (uint256) {
        _suscriptionIds.increment();
        uint256 newSuscriptionId = _suscriptionIds.current();

        Suscription storage suscription = suscriptions[newSuscriptionId];

        suscription.creator = msg.sender;
        suscription.price = price;

        return newSuscriptionId;
    }

    function suscribeTo(uint256 _id) public payable returns (bool) {
        Suscription storage suscription = suscriptions[_id];

        require(suscription.price <= msg.value, "NOT ENOUGHT ETH");

        (bool success, ) = payable(suscription.creator).call{value: msg.value}(
            ""
        );
        require(success, "Payment failed");

        suscription.suscribers[msg.sender] = block.timestamp + 30 days;

        return true;
    }

    modifier suscriptionActive(uint256 _id) {
        require(
            suscriptions[_id].suscribers[msg.sender] < block.timestamp,
            "NOT A VALID SUSCRIPTION"
        );
        _;
    }

    function getNFTFromCreator(uint256 _id)
        public
        view
        suscriptionActive(_id)
        returns (ListedToken[] memory)
    {
        uint256 nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < nftCount; i++) {
            uint256 currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId];
            if (currentItem.isForSuscriberOnly == false) {
                tokens[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return tokens;
    }


    function createToken(
        string memory tokenURI,
        uint256 price,
        bool isForSuscriberOnly
    ) public payable returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedToken(newTokenId, price, isForSuscriberOnly);

        return newTokenId;
    }

    function createListedToken(
        uint256 tokenId,
        uint256 price,
        bool isForSuscriberOnly
    ) private {
        require(msg.value >= listPrice, "Not enough eth");

        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(msg.sender),
            price,
            true,
            isForSuscriberOnly
        );

        emit TokenListedSuccess(tokenId, msg.sender, price, true);
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < nftCount; i++) {
            uint256 currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId];
            if (currentItem.isForSuscriberOnly == false) {
                tokens[currentIndex] = currentItem;
                
            }
            currentIndex += 1;
        }

        return tokens;
    }
}
